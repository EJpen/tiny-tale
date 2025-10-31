"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/helpers";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  index < currentStep
                    ? "bg-pink-500 text-white"
                    : index === currentStep
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-500"
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.div>
              <span className="text-xs mt-2 text-gray-600 text-center max-w-16">
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-16 mx-4 transition-colors",
                  index < currentStep ? "bg-pink-500" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
