"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RouletteWheel } from "@/components/RouletteWheel";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import {
  ArrowLeft,
  Crown,
  Users,
  Loader2,
  AlertCircle,
  X,
  Key,
} from "lucide-react";
import { api, type Room, type Vote } from "@/lib/api";
import { genderLabels, genderEmojis, storage } from "@/lib/helpers";
import { toast } from "sonner";
import Link from "next/link";

interface RoulettePageProps {
  params: Promise<{ roomId: string }>;
}

export default function RoulettePage({ params }: RoulettePageProps) {
  const [roomId, setRoomId] = useState<string>("");
  const [room, setRoom] = useState<Room | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPinModal, setShowPinModal] = useState(true);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);

  // Helper function to check if user came from authorized source
  const checkAuthorizedAccess = (roomId: string): boolean => {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const fromReveal = urlParams.get("from") === "reveal";

    // Check referrer
    const referrer = document.referrer;
    const cameFromRoom =
      referrer.includes(`/room/${roomId}`) && !referrer.includes("/roulette");

    // Check session-based flag (for cases where referrer might be unreliable)
    const sessionKey = `roulette_access_${roomId}`;
    const hasSessionAccess = sessionStorage.getItem(sessionKey) === "granted";

    // Clean up URL parameter and session after checking
    if (fromReveal) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("from");
      window.history.replaceState({}, "", newUrl.toString());

      // Set session flag for future navigation within the same session
      sessionStorage.setItem(sessionKey, "granted");
    }

    // Clean up session flag after use (single use)
    if (hasSessionAccess) {
      sessionStorage.removeItem(sessionKey);
    }

    return fromReveal || cameFromRoom || hasSessionAccess;
  };

  useEffect(() => {
    const initializePage = async () => {
      try {
        const resolvedParams = await params;
        setRoomId(resolvedParams.roomId);

        const hasAuthorizedAccess = checkAuthorizedAccess(
          resolvedParams.roomId
        );

        if (hasAuthorizedAccess) {
          setPinVerified(true);
          setShowPinModal(false);
          setIsHost(true); // Grant host access when coming from reveal
        } else {
          console.log("🔒 PIN required: Direct access to roulette page");
        }

        await loadRoomData(resolvedParams.roomId);
        checkHostAccess(resolvedParams.roomId);
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
        api.getRoom(id),
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
    } catch (error) {
      console.error("Error loading room data:", error);
      toast.error("Failed to load room data");
    }
  };

  const checkHostAccess = (id: string) => {
    const hostData = storage.getHostData();
    if (hostData && hostData.roomId === id) {
      setIsHost(true);
      // If user is already verified as host AND not coming from reveal, skip PIN modal
      if (!pinVerified) {
        setPinVerified(true);
        setShowPinModal(false);
        console.log("🔑 Access granted: Host already verified");
      }
    }
  };

  const handlePinSubmit = async () => {
    if (!pin || pin.length !== 4) {
      setPinError("Please enter a 4-digit PIN");
      return;
    }

    setVerifyingPin(true);
    setPinError("");

    try {
      const response = await api.verifyHostPin(roomId, pin);

      if (!response.success) {
        setPinError("Invalid PIN. Please try again.");
        return;
      }

      setPinVerified(true);
      setShowPinModal(false);
      setIsHost(true);
      toast.success("Access granted to Winner Roulette!");

    } catch (error) {
      console.error("Error verifying PIN:", error);
      setPinError("Failed to verify PIN. Please try again.");
    } finally {
      setVerifyingPin(false);
    }
  };

  const handlePinCancel = () => {
    setShowPinModal(false);
    window.history.back();
  };

  const handleWinner = async (winnerName: string) => {
    setWinner(winnerName);
    setShowConfetti(true);

    // Find the winner's vote and mark them as winner (not out)
    const winnerVote = votes.find(
      (vote) => vote.name === winnerName && vote.gender === room?.gender
    );

    if (winnerVote) {
      try {
        await api.updateVote(winnerVote.id, { isOut: false });
      } catch (error) {
        console.error("Error updating winner:", error);
      }
    }

    toast.success(`🎉 ${winnerName} is the winner!`);

    // Reset confetti after animation
    setTimeout(() => setShowConfetti(false), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading roulette...</p>
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

  // Get participants who voted for the correct gender
  const correctVotes = votes.filter((vote) => vote.gender === room.gender);
  const participants = correctVotes.map((vote) => vote.name);

  const totalVotes = votes.length;
  const correctVoteCount = correctVotes.length;
  const incorrectVoteCount = totalVotes - correctVoteCount;

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-blue-50">
      <ConfettiEffect trigger={showConfetti} />

      {/* PIN Authentication Modal */}
      <AnimatePresence>
        {showPinModal && !pinVerified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Host Access
                </h2>
                <p className="text-gray-600">
                  Please enter the 4-digit PIN to access the Winner Roulette
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="roulettePin"
                    className="text-sm font-medium text-gray-700"
                  >
                    PIN
                  </Label>
                  <Input
                    id="roulettePin"
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, ""));
                      setPinError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && pin.length === 4) {
                        handlePinSubmit();
                      }
                    }}
                    placeholder="Enter 4-digit PIN"
                    className="text-center text-lg tracking-widest mt-2 rounded-lg border-2 focus:border-black"
                    disabled={verifyingPin}
                  />
                  {pinError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2"
                    >
                      {pinError}
                    </motion.p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handlePinCancel}
                    variant="outline"
                    className="flex-1 rounded-lg"
                    disabled={verifyingPin}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePinSubmit}
                    disabled={pin.length !== 4 || verifyingPin}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 rounded-lg"
                  >
                    {verifyingPin ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Access Roulette"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Only show when PIN is verified */}
      {pinVerified && (
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Link
              href={`/room/${roomId}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Voting Room
            </Link>

            <div className="text-6xl mb-4">🎡</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Winner Selection Roulette
            </h1>
            <p className="text-gray-600">{room.roomName}</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto"
          >
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-gray-800">{totalVotes}</p>
                <p className="text-sm text-gray-600">Total Votes</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Crown className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-800">
                  {correctVoteCount}
                </p>
                <p className="text-sm text-green-600">
                  Correct ({genderLabels[room.gender]}{" "}
                  {genderEmojis[room.gender]})
                </p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold text-red-800">
                  {incorrectVoteCount}
                </p>
                <p className="text-sm text-red-600">Incorrect</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reveal Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-md mx-auto mb-8"
          >
            <Card className="bg-linear-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-center text-purple-800">
                  🎉 The Baby is a {genderLabels[room.gender]}!{" "}
                  {genderEmojis[room.gender]}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-purple-700">
                  {correctVoteCount} people guessed correctly and are eligible
                  to win!
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Roulette Wheel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <RouletteWheel
              participants={participants}
              onWinner={handleWinner}
              correctGender={room.gender}
            />
          </motion.div>

          <AnimatePresence>
            {winner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              >
                <Card className="w-full max-w-md bg-white">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="text-6xl mb-4"
                    >
                      🏆
                    </motion.div>

                    <h3 className="text-2xl font-bold text-yellow-800 mb-2">
                      CONGRATULATIONS!
                    </h3>
                    <p className="text-xl text-yellow-700 mb-2">
                      <strong>{winner}</strong>
                    </p>
                    <p className="text-yellow-600">
                      You are the winner of {room.roomName}! 🎉
                    </p>

                    <div className="flex justify-center mt-10">
                      <Button
                        onClick={() => setWinner(null)}
                        variant="outline"
                        size="icon"
                        className="rounded-full w-12 h-12 flex items-center justify-center border-2 border-yellow-600 text-gray-500 hover:bg-gray-200"
                      >
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
