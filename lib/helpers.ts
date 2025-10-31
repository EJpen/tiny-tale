import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Gender-related utilities
export const genderColors = {
  male: {
    primary: "bg-blue-500",
    light: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-300",
    hover: "hover:bg-blue-600",
  },
  female: {
    primary: "bg-pink-500",
    light: "bg-pink-100",
    text: "text-pink-600",
    border: "border-pink-300",
    hover: "hover:bg-pink-600",
  },
};

export const genderEmojis = {
  male: "💙",
  female: "💖",
};

export const genderLabels = {
  male: "Boy",
  female: "Girl",
};

// Generate random ID (for temporary use)
export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Local storage helpers
export const storage = {
  setHostData(data: { userId: string; username: string; roomId?: string }) {
    if (typeof window !== "undefined") {
      localStorage.setItem("tiny-tale-host", JSON.stringify(data));
    }
  },

  getHostData(): { userId: string; username: string; roomId?: string } | null {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("tiny-tale-host");
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  clearHostData() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tiny-tale-host");
    }
  },
};

// Share Web API
export async function shareRoom(roomUrl: string, roomName: string) {
  if (typeof window !== "undefined" && "share" in navigator) {
    try {
      await navigator.share({
        title: `Join ${roomName} - Tiny Tale`,
        text: `Vote on our gender reveal! 🎉`,
        url: roomUrl,
      });
      return true;
    } catch (error) {
      console.log("Share cancelled or failed:", error);
      return false;
    }
  }
  return false;
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window !== "undefined" && "clipboard" in navigator) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Failed to copy:", error);
      return false;
    }
  }
  return false;
}
