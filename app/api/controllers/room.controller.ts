import { supabaseAdmin } from "../../../lib/supabase-admin";
import { ResponseService } from "../core/services/response.service";
import crypto from "crypto";

// Simple UUID v4 generator
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const getRooms = async () => {
  try {
    const { data: rooms, error } = await supabaseAdmin
      .from("rooms")
      .select(
        `
        id,
        roomName,
        createdAt,
        updatedAt,
        trusteeId
      `
      )
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return ResponseService.error("Failed to fetch rooms");
    }

    // Get trustee info and vote counts separately
    const roomsWithDetails = await Promise.all(
      (rooms || []).map(async (room) => {
        // Get trustee info
        const { data: trustee } = await supabaseAdmin
          .from("users")
          .select("id, username")
          .eq("id", room.trusteeId)
          .single();

        // Get vote count
        const { count } = await supabaseAdmin
          .from("votes")
          .select("*", { count: "exact", head: true })
          .eq("roomId", room.id);

        return {
          ...room,
          trustee,
          _count: { votes: count || 0 },
        };
      })
    );

    return ResponseService.success(
      roomsWithDetails,
      "Rooms fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return ResponseService.error("Failed to fetch rooms");
  }
};

export const getRoomById = async (id: string) => {
  try {
    const { data: room, error } = await supabaseAdmin
      .from("rooms")
      .select(
        `
        id,
        roomName,
        gender,
        isClose,
        createdAt,
        updatedAt,
        trusteeId
      `
      )
      .eq("id", id)
      .single();

    if (error || !room) {
      return ResponseService.notFound("Room");
    }

    // Get trustee info separately
    const { data: trustee } = await supabaseAdmin
      .from("users")
      .select("id, username")
      .eq("id", room.trusteeId)
      .single();

    // Get vote count
    const { count } = await supabaseAdmin
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("roomId", id);

    const transformedRoom = {
      ...room,
      trustee,
      _count: { votes: count || 0 },
    };

    return ResponseService.success(
      transformedRoom,
      "Room fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching room:", error);
    return ResponseService.error("Failed to fetch room");
  }
};

export const getRoomByIdPublic = async (id: string) => {
  try {
    const { data: room, error } = await supabaseAdmin
      .from("rooms")
      .select(
        `
        id,
        roomName,
        isClose,
        createdAt,
        updatedAt,
        trusteeId
      `
      )
      .eq("id", id)
      .single();

    if (error || !room) {
      return ResponseService.notFound("Room");
    }

    // Get trustee info separately
    const { data: trustee } = await supabaseAdmin
      .from("users")
      .select("id, username")
      .eq("id", room.trusteeId)
      .single();

    // Get vote count
    const { count } = await supabaseAdmin
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("roomId", id);

    const transformedRoom = {
      ...room,
      trustee,
      _count: { votes: count || 0 },
    };

    return ResponseService.success(
      transformedRoom,
      "Room fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching room:", error);
    return ResponseService.error("Failed to fetch room");
  }
};

export const createRoom = async (data: {
  trusteeId: string;
  roomName: string;
  gender: string;
}) => {
  try {
    const { trusteeId, roomName, gender } = data;

    // Check if room name already exists
    const { data: existingRoom } = await supabaseAdmin
      .from("rooms")
      .select("id")
      .eq("roomName", roomName)
      .single();

    if (existingRoom) {
      return ResponseService.conflict("Room name already exists");
    }

    // Generate PINs
    const randOwnerPin = Math.floor(1000 + Math.random() * 9000).toString();
    const randMemberPin = Math.floor(1000 + Math.random() * 9000).toString();

    const hash = (pin: string) =>
      crypto.createHash("sha256").update(pin).digest("hex");

    const ownerPinHash = hash(randOwnerPin);
    const memberPinHash = hash(randMemberPin);

    // Create the room
    const roomId = generateUUID();
    const { data: room, error } = await supabaseAdmin
      .from("rooms")
      .insert({
        id: roomId,
        trusteeId,
        roomName,
        gender,
        ownerPin: ownerPinHash,
        memberPin: memberPinHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select(
        `
        id,
        roomName,
        gender,
        createdAt,
        updatedAt,
        trusteeId
      `
      )
      .single();

    if (error) {
      console.error("Failed to create room:", error);
      return ResponseService.error("Failed to create room");
    }

    // Get trustee info
    const { data: trustee } = await supabaseAdmin
      .from("users")
      .select("id, username")
      .eq("id", trusteeId)
      .single();

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const roomUrl = `${baseUrl}/room/${room.id}`;

    const responseData = {
      ...room,
      trustee,
      roomUrl,
      ownerPin: randOwnerPin,
      memberPin: randMemberPin,
    };

    return ResponseService.success(
      responseData,
      "Room created successfully",
      201
    );
  } catch (error) {
    console.error("Error creating room:", error);
    return ResponseService.error("Failed to create room");
  }
};

export const updateRoom = async (
  id: string,
  data: { trusteeId?: string; roomName?: string; gender?: string }
) => {
  try {
    const { data: existingRoom } = await supabaseAdmin
      .from("rooms")
      .select("*")
      .eq("id", id)
      .single();

    if (!existingRoom) {
      return ResponseService.notFound("Room");
    }

    if (data.trusteeId) {
      const { data: trustee } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", data.trusteeId)
        .single();

      if (!trustee) {
        return ResponseService.notFound("Trustee");
      }
    }

    if (data.roomName && data.roomName !== existingRoom.roomName) {
      const { data: duplicateRoom } = await supabaseAdmin
        .from("rooms")
        .select("id")
        .eq("roomName", data.roomName)
        .single();

      if (duplicateRoom) {
        return ResponseService.conflict("Room name already exists");
      }
    }

    const { data: room, error } = await supabaseAdmin
      .from("rooms")
      .update(data)
      .eq("id", id)
      .select(
        `
        id,
        roomName,
        isClose,
        createdAt,
        updatedAt,
        trusteeId
      `
      )
      .single();

    if (error) {
      console.error("Supabase error updating room:", error);
      return ResponseService.error("Failed to update room");
    }

    // Get trustee info separately
    const { data: updateTrustee } = await supabaseAdmin
      .from("users")
      .select("id, username")
      .eq("id", room.trusteeId)
      .single();

    // Get vote count
    const { count } = await supabaseAdmin
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("roomId", id);

    const transformedRoom = {
      ...room,
      trustee: updateTrustee,
      _count: { votes: count || 0 },
    };

    return ResponseService.success(
      transformedRoom,
      "Room updated successfully"
    );
  } catch (error) {
    console.error("Error updating room:", error);
    return ResponseService.error("Failed to update room");
  }
};

export const closeRoom = async (id: string, data: { isClose?: boolean }) => {
  try {
    const { data: existingRoom } = await supabaseAdmin
      .from("rooms")
      .select("id")
      .eq("id", id)
      .single();

    if (!existingRoom) {
      return ResponseService.notFound("Room");
    }

    const { data: room, error } = await supabaseAdmin
      .from("rooms")
      .update(data)
      .eq("id", id)
      .select(
        `
        id,
        roomName,
        isClose,
        createdAt,
        updatedAt
      `
      )
      .single();

    if (error) {
      console.error("Supabase error updating room status:", error);
      return ResponseService.error("Failed to update room status");
    }

    return ResponseService.success(room, "Room status updated successfully");
  } catch (error) {
    console.error("Error updating room status:", error);
    return ResponseService.error("Failed to update room status");
  }
};

export const deleteRoom = async (id: string) => {
  try {
    const { data: existingRoom } = await supabaseAdmin
      .from("rooms")
      .select("id")
      .eq("id", id)
      .single();

    if (!existingRoom) {
      return ResponseService.notFound("Room");
    }

    const { error } = await supabaseAdmin.from("rooms").delete().eq("id", id);

    if (error) {
      console.error("Supabase error deleting room:", error);
      return ResponseService.error("Failed to delete room");
    }

    return ResponseService.success(null, "Room deleted successfully");
  } catch (error) {
    console.error("Error deleting room:", error);
    return ResponseService.error("Failed to delete room");
  }
};
