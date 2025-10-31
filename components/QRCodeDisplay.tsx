"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import {
  Copy,
  Share2,
  ExternalLink,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { shareRoom, copyToClipboard } from "@/lib/helpers";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  roomUrl: string;
  roomName: string;
  ownerPin?: string;
  memberPin?: string;
}

export function QRCodeDisplay({
  roomUrl,
  roomName,
  ownerPin,
  memberPin,
}: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(roomUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: "#1f2937",
            light: "#ffffff",
          },
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQR();
  }, [roomUrl]);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(roomUrl);
    if (success) {
      toast.success("Room link copied to clipboard!");
    } else {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    const success = await shareRoom(roomUrl, roomName);
    if (!success) {
      // Fallback to copy if share API is not available
      handleCopyLink();
    }
  };

  const handleOpenRoom = () => {
    window.open(roomUrl, "_blank");
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.download = `${roomName}-qrcode.png`;
      link.href = qrCodeUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded!");
    } else {
      toast.error("QR code not ready for download");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-6"
    >
      <Card className="p-6 text-center">
        <CardContent className="space-y-4">
          <div className="bg-linear-to-br from-pink-50 to-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Room Name</p>
            <p className="font-medium text-gray-800">{roomName}</p>
          </div>

          {qrCodeUrl && (
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-200">
              <img
                src={qrCodeUrl}
                alt="QR Code for room"
                className="mx-auto w-48 h-48 mb-2"
              />
              <Button variant="outline" onClick={handleDownloadQR}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Scan to join the voting room
              </p>
            </div>
          )}

          {(ownerPin || memberPin) && (
            <div className="text-sm">
              {ownerPin && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="relative flex items-center justify-center mb-1">
                    <p className="font-medium text-purple-700">Host PIN</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-0 h-6 w-6 p-0 text-purple-600 hover:text-purple-700"
                    >
                      {showPin ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-purple-600 font-mono text-lg">
                    {showPin ? ownerPin : "••••"}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleShare}
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white px-8 py-4 text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Room
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleCopyLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>

              <Button variant="outline" onClick={handleOpenRoom}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Room
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
