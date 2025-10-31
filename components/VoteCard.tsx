"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { genderColors, genderEmojis, genderLabels } from "@/lib/helpers";
import Image from "next/image";

interface VoteCardProps {
  gender: "male" | "female";
  count: number;
  onVote: () => void;
  disabled?: boolean;
  voted?: boolean;
}

export function VoteCard({
  gender,
  count,
  onVote,
  disabled,
  voted,
}: VoteCardProps) {
  const colors = genderColors[gender];
  const emoji = genderEmojis[gender];
  const label = genderLabels[gender];

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className="w-full"
    >
      <Card
        className={`overflow-hidden transition-all duration-300 ${
          voted
            ? "ring-2 ring-offset-2 " + colors.primary.replace("bg-", "ring-")
            : ""
        } ${disabled ? "opacity-50" : "hover:shadow-lg"}`}
      >
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div>
              <h3 className={`text-xl font-semibold mb-5 ${colors.text}`}>
                I’m with Team {label}!
              </h3>
              <div className="mb-3">
                <div className="w-32 h-32 mx-auto relative overflow-hidden rounded-lg">
                  <Image
                    src={`/baby-${gender === "male" ? "boy" : "girl"}.png`}
                    alt={`Baby ${gender === "male" ? "boy" : "girl"}`}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                {count} {count === 1 ? "vote" : "votes"}
              </p>
            </div>

            <Button
              onClick={onVote}
              disabled={disabled}
              className={`w-full ${colors.primary} ${colors.hover} text-white`}
              size="lg"
            >
              {voted ? "Voted" : "Vote"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
