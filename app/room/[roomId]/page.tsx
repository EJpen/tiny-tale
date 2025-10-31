"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoteCard } from "@/components/VoteCard";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import {
  Users,
  Loader2,
  Settings,
  X,
  Check,
  RotateCcw,
  Key,
} from "lucide-react";
import { api, type PublicRoom, type Vote, type Room } from "@/lib/api";
import { genderEmojis, genderLabels, storage } from "@/lib/helpers";
import { usePusherRoom } from "@/lib/usePusher";
import { toast } from "sonner";
import Link from "next/link";
import { Dancing_Script } from "next/font/google";
import Image from "next/image";
import { SparkleEffect } from "@/components/SparkeEffect";

const voteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type VoteFormData = z.infer<typeof voteSchema>;

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const [roomId, setRoomId] = useState<string>("");
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlickering, setIsFlickering] = useState(false);
  const [showGender, setShowGender] = useState(false);
  const [actualGender, setActualGender] = useState<"male" | "female" | null>(
    null
  );
  const [revealUsed, setRevealUsed] = useState(false);
  const [manageMode, setManageMode] = useState(false);
  const [deletingVotes, setDeletingVotes] = useState<Set<string>>(new Set());
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [showHostModal, setShowHostModal] = useState(false);
  const [hostPin, setHostPin] = useState("");
  const [hostPinError, setHostPinError] = useState("");
  const [roomClosed, setRoomClosed] = useState(false);
  const [closingRoom, setClosingRoom] = useState(false);

  // Pusher real-time connection
  const pusherConnection = usePusherRoom({
    roomId,
    onNewVote: (newVote) => {
      setVotes((prevVotes) => [...prevVotes, newVote]);
    },
    onVoteDeleted: (deletedVoteId) => {
      setVotes((prevVotes) =>
        prevVotes.filter((vote) => vote.id !== deletedVoteId)
      );
    },
  });

  const form = useForm<VoteFormData>({
    resolver: zodResolver(voteSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    const initializePage = async () => {
      try {
        const resolvedParams = await params;
        setRoomId(resolvedParams.roomId);
        await loadRoomData(resolvedParams.roomId);
      } catch (error) {
        console.error("Error initializing page:", error);
        toast.error("Failed to load room");
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [params]);

  const loadRoomData = async (id: string) => {
    try {
      const [roomResponse, votesResponse] = await Promise.all([
        api.getRoomPublic(id),
        api.getVotes({ roomId: id }),
      ]);

      if (!roomResponse.success) {
        toast.error("Room not found");
        return;
      }

      setRoom(roomResponse.data);
      if (votesResponse.success) {
        setVotes(votesResponse.data);
      }

      // Set room closed state
      setRoomClosed(roomResponse.data.isClose || false);

      // Check if current user is the host
      const hostData = storage.getHostData();
      if (hostData && hostData.roomId === id) {
        setIsHost(true);

        const fullRoomResponse = await api.getRoom(id);
        if (fullRoomResponse.success) {
          setActualGender(fullRoomResponse.data.gender);
        }
      }
    } catch (error) {
      console.error("Error loading room data:", error);
      toast.error("Failed to load room data");
    }
  };

  const handleVote = async (selectedGender: "male" | "female") => {
    const isValid = await form.trigger();
    if (!isValid) return;

    if (hasVoted) {
      toast.error("You have already voted!");
      return;
    }

    if (roomClosed) {
      toast.error("Voting is closed for this room!");
      return;
    }

    setVoting(true);
    try {
      const formData = form.getValues();
      const voteResponse = await api.createVote({
        roomId,
        name: formData.name,
        gender: selectedGender,
        isOut: false,
      });

      if (!voteResponse.success) {
        toast.error(voteResponse.message || "Failed to vote");
        return;
      }

      setUserVote(voteResponse.data);
      setHasVoted(true);
      setShowConfetti(true);

      if (pusherConnection.connectionState !== "connected") {
        await loadRoomData(roomId);
      }

      toast.success(
        `Vote cast for ${genderLabels[selectedGender]}! ${genderEmojis[selectedGender]}`
      );

      // Reset confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setVoting(false);
    }
  };

  const getVoteCounts = () => {
    const maleCount = votes.filter((vote) => vote.gender === "male").length;
    const femaleCount = votes.filter((vote) => vote.gender === "female").length;
    return { maleCount, femaleCount, totalCount: maleCount + femaleCount };
  };

  const handleReveal = () => {
    if (revealUsed || !actualGender) return;

    setShowReveal(true);
    setRevealUsed(true);

    // Start countdown
    let count = 10;
    setCountdown(count);

    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);

      if (count === 0) {
        clearInterval(countdownInterval);
        setCountdown(null);

        setIsFlickering(true);

        setTimeout(() => {
          setIsFlickering(false);
          setShowGender(true);
          setShowConfetti(true);
          setShowSparkle(true);

          // Reset confetti after animation
          setTimeout(() => setShowConfetti(false), 10000);
          setTimeout(() => setShowSparkle(false), 10000);
        }, 4000); // Flicker for 4 seconds
      }
    }, 1000);
  };

  const resetReveal = () => {
    setShowReveal(false);
    setCountdown(null);
    setIsFlickering(false);
    setShowGender(false);
    setShowConfetti(false);
  };

  const handleHostPinSubmit = async () => {
    if (!hostPin || hostPin.length !== 4) {
      setHostPinError("Please enter a 4-digit pin");
      return;
    }

    try {
      const response = await api.verifyHostPin(roomId, hostPin);

      if (!response.success) {
        setHostPinError("Invalid pin. Please try again.");
        return;
      }

      // Successfully verified as host
      setIsHost(true);
      setActualGender(response.data.gender);
      setShowHostModal(false);
      setHostPin("");
      setHostPinError("");

      toast.success("Host access granted!");
    } catch (error) {
      console.error("Error verifying pin:", error);
      setHostPinError("Failed to verify pin. Please try again.");
    }
  };

  const handleDeleteVote = async (voteId: string) => {
    setDeletingVotes((prev) => new Set(prev).add(voteId));

    try {
      const response = await api.deleteVote(voteId);

      if (!response.success) {
        toast.error(response.message || "Failed to delete vote");
        return;
      }

      // Update the votes list by removing the deleted vote
      setVotes((prev) => prev.filter((vote) => vote.id !== voteId));

      toast.success("Vote deleted successfully");
    } catch (error) {
      console.error("Error deleting vote:", error);
      toast.error("Failed to delete vote");
    } finally {
      setDeletingVotes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(voteId);
        return newSet;
      });
      setConfirmingDelete(null);
    }
  };

  const handleCloseRoom = async () => {
    setClosingRoom(true);

    try {
      const response = await api.closeRoom(roomId, !roomClosed);

      if (!response.success) {
        toast.error(response.message || "Failed to update room status");
        return;
      }

      setRoomClosed(!roomClosed);
      toast.success(
        roomClosed ? "Voting has been reopened!" : "Voting has been closed!"
      );
    } catch (error) {
      console.error("Error updating room status:", error);
      toast.error("Failed to update room status");
    } finally {
      setClosingRoom(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Room Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The room you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button className="bg-pink-500 hover:bg-pink-600">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { maleCount, femaleCount, totalCount } = getVoteCounts();

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-blue-50">
      <ConfettiEffect trigger={showConfetti} />
      <SparkleEffect trigger={showSparkle} />

      <div className="container mx-auto px-4 py-8">
        {/* Host Access Button - Top Right */}
        {!isHost && (
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setShowHostModal(true)}
              variant="outline"
              size="sm"
              className="bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700"
            >
              <Key className="w-4 h-4 mr-2" />
              Host Access
            </Button>
          </div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <Image
              src="/tinyTale-logo.png"
              alt="Logo"
              width={90}
              height={90}
              className="object-cover rounded-lg"
              style={{ width: "90px", height: "auto" }}
            />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            {room.roomName}
          </h1>
          <p className="text-gray-600">Cast your vote for the baby's gender!</p>

          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{totalCount} votes</span>
            </div>

            {/* Real-time connection status */}
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  pusherConnection.isConnected
                    ? "bg-green-500"
                    : pusherConnection.connectionState === "disabled"
                    ? "bg-gray-400"
                    : "bg-yellow-500"
                }`}
              />
              <span className="text-xs">
                {pusherConnection.isConnected
                  ? "Live"
                  : pusherConnection.connectionState === "disabled"
                  ? "Updates on refresh"
                  : "Connecting..."}
              </span>
            </div>

            {/* Voting Status */}
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  roomClosed ? "bg-red-500" : "bg-green-500"
                }`}
              />
              <span className="text-xs">
                {roomClosed ? "Voting is Closed" : "Voting is Open"}
              </span>
            </div>
          </div>

          {/* Host Controls */}
          {isHost && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 space-y-3"
            >
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleCloseRoom}
                  disabled={closingRoom}
                  variant="outline"
                  className={`${
                    roomClosed
                      ? "bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                      : "bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                  }`}
                >
                  {closingRoom ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : roomClosed ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  {roomClosed ? "Reopen Voting" : "Close Voting"}
                </Button>

                <Button
                  onClick={() => setManageMode(!manageMode)}
                  variant="outline"
                  className={`${
                    manageMode
                      ? "bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {manageMode ? "Exit Manage" : "Manage Votes"}
                </Button>

                {!revealUsed && actualGender && (
                  <Button
                    onClick={handleReveal}
                    className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white"
                  >
                    Let's Reveal It!
                  </Button>
                )}

                {revealUsed && (
                  <Link href={`/room/${roomId}/roulette?from=reveal`}>
                    <Button
                      variant="outline"
                      className="bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Winner Roulette
                    </Button>
                  </Link>
                )}
              </div>

              {revealUsed && (
                <p className="text-center text-sm text-gray-500">
                  Gender has been revealed! 🎉
                </p>
              )}
            </motion.div>
          )}
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Voting Closed Message */}
          {roomClosed && !hasVoted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-linear-to-br from-red-50 to-orange-50 border-red-200">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">🔒</div>
                  <h3 className="text-xl font-semibold text-red-800 mb-2">
                    Voting is Currently Closed
                  </h3>
                  <p className="text-red-700">
                    The host has temporarily closed voting for this room.
                  </p>
                  <p className="text text-red-700 mt-2">
                    Please wait for the host to reopen voting to cast your vote!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Vote Success Message */}
          {hasVoted && userVote && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="bg-linear-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Vote Cast Successfully!
                  </h3>
                  <p className="text-green-700">
                    You voted for{" "}
                    <strong>
                      {genderLabels[userVote.gender]}{" "}
                      {genderEmojis[userVote.gender]}
                    </strong>
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    If you're correct, you might be selected for a prize! 🏆
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Voting Form */}
          {!hasVoted && !roomClosed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    Let’s get you in the game!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your name to vote"
                        {...form.register("name")}
                        className="mt-2"
                      />
                      {form.formState.errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">📋 How it works:</p>
                      <p>
                        Pop your name in and cast your vote! Think you’ve got
                        the right guess? You could snag a sweet prize if you’re
                        right! 🎉
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Vote Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <VoteCard
              gender="male"
              count={maleCount}
              onVote={() => handleVote("male")}
              disabled={voting || hasVoted || !form.watch("name") || roomClosed}
              voted={userVote?.gender === "male"}
            />
            <VoteCard
              gender="female"
              count={femaleCount}
              onVote={() => handleVote("female")}
              disabled={voting || hasVoted || !form.watch("name") || roomClosed}
              voted={userVote?.gender === "female"}
            />
          </motion.div>

          {/* Voting Progress Bar */}
          {votes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardContent className="p-6">
                  {(() => {
                    const boyPercentage =
                      totalCount > 0
                        ? Math.round((maleCount / totalCount) * 100)
                        : 0;
                    const girlPercentage =
                      totalCount > 0
                        ? Math.round((femaleCount / totalCount) * 100)
                        : 0;

                    return (
                      <div className="space-y-4">
                        <div className="relative w-full h-10 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          {/* Boy Progress (Blue) - Left side */}
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${boyPercentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center"
                          >
                            {boyPercentage > 10 && (
                              <span className="text-white text-sm font-bold">
                                {boyPercentage}%
                              </span>
                            )}
                          </motion.div>

                          {/* Girl Progress (Pink) - Right side */}
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${girlPercentage}%` }}
                            transition={{
                              duration: 0.8,
                              ease: "easeOut",
                              delay: 0.1,
                            }}
                            className="absolute right-0 top-0 h-full bg-linear-to-l from-pink-400 to-pink-500 flex items-center justify-center"
                          >
                            {girlPercentage > 10 && (
                              <span className="text-white text-sm font-bold">
                                {girlPercentage}%
                              </span>
                            )}
                          </motion.div>
                        </div>

                        {/* Vote Counts */}
                        <div className="flex justify-between items-center text-xs text-gray-600">
                          <span>
                            {maleCount} vote{maleCount !== 1 ? "s" : ""}
                          </span>
                          <span className="font-semibold">
                            {totalCount} total votes
                          </span>
                          <span>
                            {femaleCount} vote{femaleCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent Voters */}
          {votes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Boy Votes */}
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-blue-600">TEAM BOY 💙</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {votes
                        .filter((vote) => vote.gender === "male")
                        .reverse()
                        .map((vote) => (
                          <div
                            key={vote.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-blue-50"
                          >
                            <span className="font-medium text-blue-700">
                              {vote.name}
                            </span>

                            {/* Management Actions - Host Only */}
                            {isHost && manageMode && (
                              <div className="flex items-center gap-2">
                                {confirmingDelete === vote.id ? (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex gap-1"
                                  >
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteVote(vote.id)}
                                      disabled={deletingVotes.has(vote.id)}
                                      className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setConfirmingDelete(null)}
                                      className="h-6 w-6 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                    </Button>
                                  </motion.div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setConfirmingDelete(vote.id)}
                                    disabled={deletingVotes.has(vote.id)}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                      {/* Empty state */}
                      {votes.filter((v) => v.gender === "male").length ===
                        0 && (
                        <p className="text-center text-gray-500 text-sm py-4">
                          No votes yet.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Girl Votes */}
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-pink-600">
                      TEAM GIRL 💖
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {votes
                        .filter((vote) => vote.gender === "female")
                        .reverse()
                        .map((vote) => (
                          <div
                            key={vote.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-pink-50"
                          >
                            <span className="font-medium text-pink-700">
                              {vote.name}
                            </span>

                            {/* Management Actions - Host Only */}
                            {isHost && manageMode && (
                              <div className="flex items-center gap-2">
                                {confirmingDelete === vote.id ? (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex gap-1"
                                  >
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteVote(vote.id)}
                                      disabled={deletingVotes.has(vote.id)}
                                      className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setConfirmingDelete(null)}
                                      className="h-6 w-6 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                    </Button>
                                  </motion.div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setConfirmingDelete(vote.id)}
                                    disabled={deletingVotes.has(vote.id)}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                      {/* Empty state */}
                      {votes.filter((v) => v.gender === "female").length ===
                        0 && (
                        <p className="text-center text-gray-500 text-sm py-4">
                          No votes yet.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Host Access Modal */}
      {showHostModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowHostModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Host Access
              </h2>
              <p className="text-gray-600">
                Enter the 4-digit pin to access host features
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="hostPin">Pin</Label>
                <Input
                  id="hostPin"
                  type="password"
                  maxLength={4}
                  value={hostPin}
                  onChange={(e) => {
                    setHostPin(e.target.value.replace(/\D/g, ""));
                    setHostPinError("");
                  }}
                  placeholder="Enter 4-digit pin"
                  className="text-center text-lg tracking-widest mt-2"
                />
                {hostPinError && (
                  <p className="text-red-500 text-sm mt-1">{hostPinError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowHostModal(false);
                    setHostPin("");
                    setHostPinError("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleHostPinSubmit}
                  disabled={hostPin.length !== 4}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600"
                >
                  Verify Pin
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Gender Reveal Overlay */}
      {showReveal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-700 ${
            isFlickering
              ? "animate-pulse"
              : countdown !== null
              ? "bg-gray-900"
              : showGender
              ? actualGender === "male"
                ? "bg-blue-200"
                : "bg-pink-200"
              : "bg-linear-to-br from-pink-300 to-blue-400"
          }`}
          style={{
            animation: isFlickering
              ? "flicker 0.3s infinite alternate"
              : undefined,
          }}
        >
          {/* Countdown */}
          {countdown !== null && (
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-center"
            >
              <div className="text-9xl font-bold text-white mb-4">
                {countdown}
              </div>
              <div className="text-2xl text-gray-300">
                Get ready for the reveal...
              </div>
            </motion.div>
          )}

          {/* Flickering State */}
          {isFlickering && (
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-4 animate-bounce">
                🎉
              </div>
              <div className="text-3xl text-white font-semibold">
                The moment is here...
              </div>
            </div>
          )}

          {/* Gender Reveal */}
          {showGender && actualGender && (
            <>
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                className="text-center"
              >
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`text-5xl font-semibold text-gray-800 mb-8 ${dancing.className}`}
                >
                  It's a...
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 1.5, // Adjust speed (higher = slower)
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                  className={`font-black mb-10 text-center ${
                    actualGender === "male" ? "text-blue-600" : "text-pink-600"
                  } text-8xl sm:text-8xl md:text9xl lg:text-9xl xl:text-[10rem]`}
                >
                  {actualGender === "male" ? "BOY" : "GIRL"}
                </motion.div>

                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="flex justify-center mt-30 z-50 relative"
                >
                  <Button
                    onClick={resetReveal}
                    size="lg"
                    className={`${
                      actualGender === "male" ? "bg-blue-300" : "bg-pink-300"
                    } text-gray-800 hover:bg-gray-100 rounded-full w-12 h-12 flex z-50 relative`}
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </motion.div>

                {/* <motion.div
                initial={{ y: "100vh" }}
                animate={{ y: ["3vh", "0vh", "3vh"] }}
                transition={{
                  duration: 2,
                  times: [0, 0.5, 1],
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
                className="absolute bottom-[-5vh] left-0 w-full h-[50vh] overflow-hidden z-10"
              >
                <Image
                  src="/cloud-design.svg"
                  alt="Clouds"
                  fill
                  className="object-cover opacity-95"
                  priority
                />
              </motion.div> */}
              </motion.div>
              <motion.div
                initial={{ y: "100vh" }}
                animate={{ y: ["3vh", "0vh", "3vh"] }}
                transition={{
                  duration: 2,
                  times: [0, 0.5, 1],
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
                className="absolute bottom-[-5vh] left-0 w-full h-[50vh] overflow-hidden z-10"
              >
                <Image
                  src="/cloud-design.svg"
                  alt="Clouds"
                  fill
                  className="object-cover opacity-95"
                  priority
                />
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
