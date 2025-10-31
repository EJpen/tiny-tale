"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Pusher from "pusher-js";
import { PUSHER_EVENTS } from "./pusher";
import { type Vote } from "./api";

interface PusherHookOptions {
  roomId: string;
  onNewVote?: (vote: Vote) => void;
  onVoteDeleted?: (voteId: string) => void;
  onGenderRevealed?: (gender: "male" | "female") => void;
}

interface PusherHookReturn {
  isConnected: boolean;
  connectionState: string;
  error: string | null;
}

export function usePusherRoom({
  roomId,
  onNewVote,
  onVoteDeleted,
  onGenderRevealed,
}: PusherHookOptions): PusherHookReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState("initializing");
  const [error, setError] = useState<string | null>(null);

  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);

  // Store callbacks in refs to avoid dependency issues
  const onNewVoteRef = useRef(onNewVote);
  const onVoteDeletedRef = useRef(onVoteDeleted);
  const onGenderRevealedRef = useRef(onGenderRevealed);

  // Update refs when callbacks change
  useEffect(() => {
    onNewVoteRef.current = onNewVote;
    onVoteDeletedRef.current = onVoteDeleted;
    onGenderRevealedRef.current = onGenderRevealed;
  }, [onNewVote, onVoteDeleted, onGenderRevealed]);

  const initializePusher = useCallback(() => {
    try {
      // Check if we're on the client side
      if (typeof window === "undefined") {
        console.log("Server side rendering, skipping Pusher initialization");
        return;
      }

      // Prevent multiple initializations
      if (pusherRef.current) {
        console.log("Pusher already initialized, skipping");
        return;
      }

      // Get environment variables (they should be available on the client with NEXT_PUBLIC_ prefix)
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

      console.log("🔍 Pusher Debug:", {
        pusherKey: pusherKey ? "✅ Found" : "❌ Missing",
        pusherCluster,
        roomId,
        allEnvKeys: Object.keys(process.env).filter((key) =>
          key.includes("PUSHER")
        ),
      });

      if (!pusherKey) {
        console.warn("Pusher key not found, real-time updates disabled");
        setConnectionState("disabled");
        return;
      }

      // Enable Pusher debugging only in development environment
      if (typeof window !== "undefined") {
        (window as any).Pusher = Pusher;
        // Check for local/development environment
        const isLocalEnv = process.env.APP_ENV === "development";

        Pusher.logToConsole = isLocalEnv;

        if (isLocalEnv) {
          console.log("🔧 Pusher debug logging enabled for local environment");
        }
      }

      // Initialize Pusher client with more conservative settings
      pusherRef.current = new Pusher(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true,
        enabledTransports: ["ws", "wss"],
        authEndpoint: undefined, // No auth needed for public channels
        activityTimeout: 30000,
        pongTimeout: 6000,
      });

      const pusher = pusherRef.current;

      // Connection event handlers
      pusher.connection.bind("connected", () => {
        console.log(`✅ Pusher connected for room ${roomId}`);
        console.log("Connection socket ID:", pusher.connection.socket_id);
        setIsConnected(true);
        setConnectionState("connected");
        setError(null);

        // Subscribe to channel after connection is established
        const channelName = `room-${roomId}`;
        console.log(`📡 Subscribing to channel: ${channelName}`);

        try {
          channelRef.current = pusher.subscribe(channelName);
          const channel = channelRef.current;

          // Bind to specific events
          if (onNewVoteRef.current) {
            channel.bind(
              PUSHER_EVENTS.NEW_VOTE,
              (data: { vote: Vote; timestamp: string }) => {
                // console.log("Received new vote:", data);
                onNewVoteRef.current?.(data.vote);
              }
            );
          }

          if (onVoteDeletedRef.current) {
            channel.bind(
              PUSHER_EVENTS.VOTE_DELETED,
              (data: { voteId: string; vote: Vote; timestamp: string }) => {
                console.log("Received vote deletion:", data);
                onVoteDeletedRef.current?.(data.voteId);
              }
            );
          }

          if (onGenderRevealedRef.current) {
            channel.bind(
              PUSHER_EVENTS.GENDER_REVEALED,
              (data: { gender: "male" | "female"; timestamp: string }) => {
                console.log("Received gender reveal:", data);
                onGenderRevealedRef.current?.(data.gender);
              }
            );
          }

          console.log(`✅ Successfully subscribed to ${channelName}`);
        } catch (subscribeError) {
          console.error("Failed to subscribe to channel:", subscribeError);
          setError("Failed to subscribe to room updates");
        }
      });

      pusher.connection.bind("connecting", () => {
        console.log(`🔄 Pusher connecting for room ${roomId}`);
        setConnectionState("connecting");
      });

      pusher.connection.bind("disconnected", () => {
        console.log(`❌ Pusher disconnected for room ${roomId}`);
        console.log("Connection state:", pusher.connection.state);
        console.log("Socket ID:", pusher.connection.socket_id);
        setIsConnected(false);
        setConnectionState("disconnected");
      });

      pusher.connection.bind("unavailable", () => {
        console.warn(`⚠️ Pusher unavailable for room ${roomId}`);
        setIsConnected(false);
        setConnectionState("unavailable");
      });

      pusher.connection.bind("failed", () => {
        console.error(`💥 Pusher connection failed for room ${roomId}`);
        setIsConnected(false);
        setConnectionState("failed");
        setError("Connection failed");
      });

      pusher.connection.bind("error", (error: any) => {
        console.error(`🚨 Pusher error for room ${roomId}:`, error);
        console.log("Error details:", {
          type: error.type,
          error: error.error,
          data: error.data,
        });
        setError(error.message || "Connection error");
      });

      console.log(`🎯 Pusher client initialized for room ${roomId}`);
    } catch (error) {
      console.error("Failed to initialize Pusher:", error);
      setError("Failed to initialize real-time connection");
      setConnectionState("error");
    }
  }, [roomId]); // Only depend on roomId, not the callback functions

  const cleanup = useCallback(() => {
    console.log("🧹 Cleaning up Pusher connection");

    if (channelRef.current) {
      channelRef.current.unbind_all();
      if (pusherRef.current && roomId) {
        pusherRef.current.unsubscribe(`room-${roomId}`);
      }
      channelRef.current = null;
    }

    if (pusherRef.current) {
      pusherRef.current.disconnect();
      pusherRef.current = null;
    }

    setIsConnected(false);
    setConnectionState("disconnected");
  }, [roomId]);

  // Initialize Pusher on mount
  useEffect(() => {
    if (!roomId) return;

    console.log("🎬 useEffect triggered for roomId:", roomId);
    initializePusher();

    // Cleanup on unmount or roomId change
    return cleanup;
  }, [roomId]); // Only depend on roomId

  return {
    isConnected,
    connectionState,
    error,
  };
}
