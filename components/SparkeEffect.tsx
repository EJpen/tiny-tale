"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface SparkEffectProps {
  trigger: boolean;
}

export function SparkleEffect({ trigger }: SparkEffectProps) {
  useEffect(() => {
    if (trigger) {
      const duration = 5000;
      const animationEnd = Date.now() + duration;

      const colors = ["#fef9c3", "#fde68a"]; // white-gold sparkle

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 30 * (timeLeft / duration);

        // Left Spark Fountain
        confetti({
          particleCount,
          startVelocity: 80,
          spread: 20,
          angle: 70, // shoot upward-left
          origin: { x: 0.2, y: 1 },
          gravity: 0.5,
          colors,
          ticks: 120,
          shapes: ["circle"],
        });

        // Right Spark Fountain
        confetti({
          particleCount,
          startVelocity: 80,
          spread: 20,
          angle: 110, // shoot upward-right
          origin: { x: 0.8, y: 1 },
          gravity: 0.5,
          colors,
          ticks: 120,
          shapes: ["circle"],
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [trigger]);

  return null;
}