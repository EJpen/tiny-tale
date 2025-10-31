import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Tiny Tale",
  description:
    "Celebrate your baby's story with Tiny Tale! Create interactive gender reveal voting experiences for friends and family.",
  icons: {
    icon: "/tinyTale-logo.png",
    shortcut: "/tinyTale-logo.png",
    apple: "/tinyTale-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans antialiased bg-linear-to-br from-pink-50 via-white to-blue-50 min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
