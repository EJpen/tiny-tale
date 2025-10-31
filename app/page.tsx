"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Baby, Heart, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const features = [
    {
      icon: Baby,
      title: "Gender Reveal Fun",
      description:
        "Create exciting voting experiences for your baby's big reveal",
    },
    {
      icon: Users,
      title: "Friends & Family",
      description: "Invite everyone to participate in your special moment",
    },
    {
      icon: Heart,
      title: "Share the Love",
      description:
        "Generate QR codes and links to easily share your voting room",
    },
    {
      icon: Sparkles,
      title: "Winner Selection",
      description:
        "Use our fun roulette wheel to pick a winner from correct guesses",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <Image
                src="/tinyTale-logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="object-cover rounded-lg"
              />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              <span className="text-pink-500">Tiny</span>{" "}
              <span className="text-blue-500">Tale</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Celebrate your baby's story with Tiny Tale! 🎉
              <br />
              Create interactive gender reveal voting experiences for friends
              and family.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/create-room">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="bg-linear-to-br from-pink-100 to-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            How it Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Create Your Room",
                description: "Enter your name, room details, and baby's gender",
                emoji: "🏠",
              },
              {
                step: "2",
                title: "Share & Vote",
                description: "Share the QR code with friends so they can vote",
                emoji: "📱",
              },
              {
                step: "3",
                title: "Pick a Winner",
                description:
                  "Use the roulette wheel to select a winner from correct votes",
                emoji: "🏆",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.2 }}
                className="text-center"
              >
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">{item.emoji}</span>
                </div>
                <div className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
