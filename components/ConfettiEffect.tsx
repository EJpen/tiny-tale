"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  trigger: boolean;
  colors?: string[];
}

export function ConfettiEffect({
  trigger,
  colors = ["#ec4899", "#3b82f6", "#ffffff"],
}: ConfettiEffectProps) {
  useEffect(() => {
    if (trigger) {
      // Fire confetti from multiple directions
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        // Left side
        confetti({
          particleCount,
          startVelocity: 30,
          spread: 70,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors,
        });

        // Right side
        confetti({
          particleCount,
          startVelocity: 30,
          spread: 70,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors,
        });
      }, 250);

      // Additional burst from center
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors,
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [trigger, colors]);

  return null;
}
