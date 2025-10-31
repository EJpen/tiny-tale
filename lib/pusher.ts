import Pusher from "pusher";

let pusherInstance: Pusher | null = null;

export function getPusherInstance(): Pusher | null {
  if (!pusherInstance) {
    try {
      const requiredEnvVars = {
        appId: process.env.PUSHER_APP_ID,
        key: process.env.NEXT_PUBLIC_PUSHER_KEY,
        secret: process.env.PUSHER_SECRET,
        cluster: process.env.PUSHER_CLUSTER,
      };

      // Check if all required environment variables are present
      const missingVars = Object.entries(requiredEnvVars)
        .filter(([, value]) => !value)
        .map(([key]) => key);

      if (missingVars.length > 0) {
        console.warn(
          `Missing Pusher environment variables: ${missingVars.join(", ")}`
        );
        return null;
      }

      pusherInstance = new Pusher({
        appId: requiredEnvVars.appId!,
        key: requiredEnvVars.key!,
        secret: requiredEnvVars.secret!,
        cluster: requiredEnvVars.cluster!,
        useTLS: true,
      });

      console.log("Pusher server instance initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Pusher:", error);
      return null;
    }
  }

  return pusherInstance;
}

// Room-specific event broadcasting
export async function broadcastToRoom(
  roomId: string,
  event: string,
  data: any
): Promise<boolean> {
  const pusher = getPusherInstance();

  if (!pusher) {
    console.warn("Pusher not available, skipping broadcast");
    return false;
  }

  try {
    const channel = `room-${roomId}`;
    await pusher.trigger(channel, event, data);
    console.log(`Broadcasted ${event} to ${channel}:`, data);
    return true;
  } catch (error) {
    console.error(`Failed to broadcast to room ${roomId}:`, error);
    return false;
  }
}

// Specific event types for type safety
export const PUSHER_EVENTS = {
  NEW_VOTE: "new-vote",
  VOTE_DELETED: "vote-deleted",
  GENDER_REVEALED: "gender-revealed",
  ROOM_UPDATED: "room-updated",
} as const;

export type PusherEvent = (typeof PUSHER_EVENTS)[keyof typeof PUSHER_EVENTS];
