"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => ({ default: mod.Wheel })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    ),
  }
);

interface RouletteWheelProps {
  participants: string[];
  onWinner: (winner: string) => void;
  correctGender: "male" | "female";
}

export function RouletteWheel({
  participants,
  onWinner,
  correctGender,
}: RouletteWheelProps) {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [currentParticipants, setCurrentParticipants] = useState(participants);
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const wheelColors = ["#FFDCDC", "#FFF2EB", "#FFE8CD", "#FFD6BA"];

  const wheelData = currentParticipants.map((name, index) => ({
    option: name,
    style: {
      backgroundColor: wheelColors[index % wheelColors.length],
      textColor: "black",
    },
  }));

  const handleSpinClick = () => {
    if (currentParticipants.length === 0) return;

    const newPrizeNumber = Math.floor(
      Math.random() * currentParticipants.length
    );
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
    setIsSpinning(true);
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setIsSpinning(false);

    const remaining = currentParticipants.filter(
      (_, index) => index !== prizeNumber
    );

    if (remaining.length === 1) {
      const finalWinner = remaining[0];
      setWinner(finalWinner);
      onWinner(finalWinner);
    } else {
      setCurrentParticipants(remaining);
    }
  };

  const resetWheel = () => {
    setCurrentParticipants(participants);
    setWinner(null);
    setPrizeNumber(0);
  };

  if (currentParticipants.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-4">😢</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No participants found
          </h3>
          <p className="text-gray-600">
            No one voted for the correct gender (
            {correctGender === "male" ? "Boy 💙" : "Girl 💖"})
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-gray-600">
              Spinning among {currentParticipants.length} participants who voted
              for {correctGender === "male" ? "Boy 💙" : "Girl 💖"}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              {mounted ? (
                <Wheel
                  mustStartSpinning={mustSpin}
                  prizeNumber={prizeNumber}
                  data={wheelData}
                  onStopSpinning={handleStopSpinning}
                  textColors={["white"]}
                  fontSize={16}
                  outerBorderColor="#374151"
                  outerBorderWidth={2}
                  innerBorderColor="#6b7280"
                  innerBorderWidth={2}
                  radiusLineColor="#374151"
                  radiusLineWidth={1}
                  textDistance={60}
                />
              ) : (
                <div className="flex items-center justify-center h-64 w-64 rounded-full bg-gray-200">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>Remaining participants: {currentParticipants.length}</p>
              {currentParticipants.length > 1 && (
                <p>Next elimination round will remove 1 participant</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSpinClick}
                disabled={isSpinning || currentParticipants.length === 0}
                size="lg"
                className="bg-linear-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-black"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                {currentParticipants.length === 2
                  ? "Spin for Final Winner!"
                  : "Spin to Eliminate"}
              </Button>

              {participants.length !== currentParticipants.length && (
                <Button onClick={resetWheel} variant="outline" size="sm">
                  Reset Wheel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
