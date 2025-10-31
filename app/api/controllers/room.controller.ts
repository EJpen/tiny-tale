import { prisma } from "../core/services/prisma.service";
import { ResponseService } from "../core/services/response.service";
import crypto from "crypto";

export const getRooms = async () => {
  try {
    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        roomName: true,
        trustee: {
          select: { id: true, username: true },
        },
        _count: {
          select: { votes: true },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return ResponseService.success(rooms, "Rooms fetched successfully");
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return ResponseService.error("Failed to fetch rooms");
  }
};

export const getRoomById = async (id: string) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id },
      select: {
        id: true,
        roomName: true,
        gender: true,
        isClose: true,
        trustee: {
          select: { id: true, username: true },
        },
        _count: {
          select: { votes: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!room) {
      return ResponseService.notFound("Room");
    }

    return ResponseService.success(room, "Room fetched successfully");
  } catch (error) {
    console.error("Error fetching room:", error);
    return ResponseService.error("Failed to fetch room");
  }
};

export const getRoomByIdPublic = async (id: string) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id },
      select: {
        id: true,
        roomName: true,
        isClose: true,
        // Exclude gender from public response
        trustee: {
          select: { id: true, username: true },
        },
        _count: {
          select: { votes: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!room) {
      return ResponseService.notFound("Room");
    }

    return ResponseService.success(room, "Room fetched successfully");
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

    // Check if trustee exists
    const trustee = await prisma.user.findUnique({
      where: { id: trusteeId },
    });

    if (!trustee) {
      return ResponseService.notFound("Trustee");
    }

    // Check if room name already exists
    const existingRoom = await prisma.room.findFirst({
      where: { roomName },
    });

    if (existingRoom) {
      return ResponseService.conflict("Room name already exists");
    }

    const randOwnerPin = Math.floor(1000 + Math.random() * 9000).toString();
    const randMemberPin = Math.floor(1000 + Math.random() * 9000).toString();

    const hash = (pin: string) =>
      crypto.createHash("sha256").update(pin).digest("hex");

    const ownerPinHash = hash(randOwnerPin);
    const memberPinHash = hash(randMemberPin);

    const room = await prisma.room.create({
      data: {
        trusteeId,
        roomName,
        gender,
        ownerPin: ownerPinHash,
        memberPin: memberPinHash,
      },
      include: {
        trustee: {
          select: { id: true, username: true },
        },
      },
    });

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    console.log("🔍 Environment APP_URL:", process.env.APP_URL);
    console.log("🔍 Using baseUrl:", baseUrl);
    const roomUrl = `${baseUrl}/room/${room.id}`;

    // Remove sensitive hashes before sending
    const { ownerPin: _1, memberPin: _2, ...safeRoom } = room;

    const responseData = {
      ...safeRoom,
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
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return ResponseService.notFound("Room");
    }

    if (data.trusteeId) {
      const trustee = await prisma.user.findUnique({
        where: { id: data.trusteeId },
      });

      if (!trustee) {
        return ResponseService.notFound("Trustee");
      }
    }

    if (data.roomName && data.roomName !== existingRoom.roomName) {
      const duplicateRoom = await prisma.room.findFirst({
        where: { roomName: data.roomName },
      });

      if (duplicateRoom) {
        return ResponseService.conflict("Room name already exists");
      }
    }

    const room = await prisma.room.update({
      where: { id },
      data,
      select: {
        id: true,
        roomName: true,
        isClose: true,
        trustee: {
          select: { id: true, username: true },
        },
        _count: {
          select: { votes: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return ResponseService.success(room, "Room updated successfully");
  } catch (error) {
    console.error("Error updating room:", error);
    return ResponseService.error("Failed to update room");
  }
};

export const closeRoom = async (id: string, data: { isClose?: boolean }) => {
  try {
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return ResponseService.notFound("Room");
    }

    const room = await prisma.room.update({
      where: { id },
      data,
      select: {
        id: true,
        roomName: true,
        isClose: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return ResponseService.success(room, "Room status updated successfully");
  } catch (error) {
    console.error("Error updating room status:", error);
    return ResponseService.error("Failed to update room status");
  }
};

export const deleteRoom = async (id: string) => {
  try {
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return ResponseService.notFound("Room");
    }

    await prisma.room.delete({
      where: { id },
    });

    return ResponseService.success(null, "Room deleted successfully");
  } catch (error) {
    console.error("Error deleting room:", error);
    return ResponseService.error("Failed to delete room");
  }
};
