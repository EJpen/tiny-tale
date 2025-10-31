"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Stepper } from "@/components/Stepper";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { api, type Room } from "@/lib/api";
import { storage } from "@/lib/helpers";
import { toast } from "sonner";
import Link from "next/link";

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  roomName: z.string().min(3, "Room name must be at least 3 characters"),
  gender: z.enum(["male", "female"]).refine((val) => val, {
    message: "Please select the baby's gender",
  }),
});

type FormData = z.infer<typeof formSchema>;

const steps = ["Your Info", "Room Details", "Share & Celebrate"];

export default function CreateRoomPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      roomName: "",
      gender: undefined,
    },
  });

  const { watch, trigger, getValues } = form;
  const watchedValues = watch();

  const nextStep = async () => {
    const fieldsToValidate =
      currentStep === 0 ? ["username"] : ["roomName", "gender"];
    const isStepValid = await trigger(fieldsToValidate as any);

    if (isStepValid) {
      if (currentStep === 1) {
        // Final step - submit form
        await handleSubmit();
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const formData = getValues();

      // Create user first
      const userResponse = await api.createUser(formData.username);
      if (!userResponse.success) {
        toast.error(userResponse.message || "Failed to create user");
        return;
      }

      // Create room
      const roomResponse = await api.createRoom({
        trusteeId: userResponse.data.id,
        roomName: formData.roomName,
        gender: formData.gender,
      });

      if (!roomResponse.success) {
        toast.error(roomResponse.message || "Failed to create room");
        return;
      }

      setCreatedRoom(roomResponse.data);
      setCurrentStep(2);
      toast.success("Room created successfully!");
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!watchedValues.username && watchedValues.username.length >= 2;
      case 1:
        return (
          !!watchedValues.roomName &&
          watchedValues.roomName.length >= 3 &&
          !!watchedValues.gender
        );
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            Create Your <span className="text-pink-500">Tiny</span>{" "}
            <span className="text-blue-500">Tale</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Let's set up your gender reveal voting room!
          </p>
        </div>

        {/* Stepper */}
        <Stepper steps={steps} currentStep={currentStep} />

        {/* Form Content */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {currentStep === 0 && "Who’s hosting?"}
                {currentStep === 1 && "Room details"}
                {currentStep === 2 && "Room Created Successfully! 🎉"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {/* Step 1: Username */}
                {currentStep === 0 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="username">Your Name</Label>
                      <Input
                        id="username"
                        placeholder="Enter your name"
                        {...form.register("username")}
                        className="mt-2"
                      />
                      {form.formState.errors.username && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">👋 Welcome!</p>
                      <p>
                        You'll be the host of this gender reveal voting room.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Room Details */}
                {currentStep === 1 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <Label htmlFor="roomName">Room Name</Label>
                      <Input
                        id="roomName"
                        placeholder="John and Jane's Gender Reveal"
                        {...form.register("roomName")}
                        className="mt-2"
                      />
                      {form.formState.errors.roomName && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.roomName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Baby's Gender</Label>
                      <RadioGroup
                        value={watchedValues.gender}
                        onValueChange={(value) =>
                          form.setValue("gender", value as "male" | "female")
                        }
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-blue-50 transition-colors">
                          <RadioGroupItem value="male" id="male" />
                          <Label
                            htmlFor="male"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">💙</span>
                              <div>
                                <p className="font-medium">Boy</p>
                                <p className="text-sm text-gray-600">
                                  It's a boy!
                                </p>
                              </div>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-pink-50 transition-colors">
                          <RadioGroupItem value="female" id="female" />
                          <Label
                            htmlFor="female"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">💖</span>
                              <div>
                                <p className="font-medium">Girl</p>
                                <p className="text-sm text-gray-600">
                                  It's a girl!
                                </p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                      {form.formState.errors.gender && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.gender.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Success & QR Code */}
                {currentStep === 2 && createdRoom && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <QRCodeDisplay
                      roomUrl={createdRoom.roomUrl || ""}
                      roomName={createdRoom.roomName}
                      ownerPin={createdRoom.ownerPin}
                      memberPin={createdRoom.memberPin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              {currentStep < 2 && (
                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid(currentStep) || isLoading}
                    className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white px-8 py-4 text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : currentStep === 1 ? (
                      "Create Room"
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
