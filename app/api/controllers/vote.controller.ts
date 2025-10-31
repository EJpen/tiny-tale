import { prisma } from "../core/services/prisma.service";
import { ResponseService } from "../core/services/response.service";
import { broadcastToRoom, PUSHER_EVENTS } from "../../../lib/pusher";

export const getVotes = async (filters?: {
  roomId?: string;
  name?: string;
  gender?: string;
  isOut?: boolean;
}) => {
  try {
    const where: any = {};
    if (filters?.roomId) where.roomId = filters.roomId;
    if (filters?.name) where.name = filters.name;
    if (filters?.gender) where.gender = filters.gender;
    if (filters?.isOut !== undefined) where.isOut = filters.isOut;

    const votes = await prisma.vote.findMany({
      where,
      include: {
        room: {
          select: { id: true, roomName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return ResponseService.success(votes, "Votes fetched successfully");
  } catch (error) {
    console.error("Error fetching votes:", error);
    return ResponseService.error("Failed to fetch votes");
  }
};

export const getVoteById = async (id: string) => {
  try {
    const vote = await prisma.vote.findUnique({
      where: { id },
      include: {
        room: {
          select: { id: true, roomName: true },
        },
      },
    });

    if (!vote) {
      return ResponseService.notFound("Vote");
    }

    return ResponseService.success(vote, "Vote fetched successfully");
  } catch (error) {
    console.error("Error fetching vote:", error);
    return ResponseService.error("Failed to fetch vote");
  }
};

export const createVote = async (data: {
  roomId: string;
  name: string;
  gender: string;
  isOut: boolean;
}) => {
  try {
    const { roomId, name, gender, isOut } = data;

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return ResponseService.notFound("Room");
    }

    // Check if name already voted in this room
    const existingVote = await prisma.vote.findFirst({
      where: {
        roomId,
        name,
      },
    });

    const isClose = room.isClose;

    if (isClose) {
      return ResponseService.conflict("Room is closed for voting");
    }

    if (existingVote) {
      return ResponseService.conflict(
        "This name has already voted in this room"
      );
    }

    const vote = await prisma.vote.create({
      data: {
        roomId,
        name,
        gender,
        isOut,
      },
      include: {
        room: {
          select: { id: true, roomName: true },
        },
      },
    });

    // Broadcast new vote to room channel
    const broadcastSuccess = await broadcastToRoom(
      roomId,
      PUSHER_EVENTS.NEW_VOTE,
      {
        vote,
        timestamp: new Date().toISOString(),
      }
    );

    if (broadcastSuccess) {
      console.log(`Vote broadcast successful for room ${roomId}`);
    } else {
      console.warn(
        `Vote broadcast failed for room ${roomId}, clients will rely on polling`
      );
    }

    return ResponseService.success(vote, "Vote created successfully", 201);
  } catch (error) {
    console.error("Error creating vote:", error);
    return ResponseService.error("Failed to create vote");
  }
};

export const updateVote = async (
  id: string,
  data: { roomId?: string; name?: string; gender?: string; isOut?: boolean }
) => {
  try {
    const existingVote = await prisma.vote.findUnique({
      where: { id },
    });

    if (!existingVote) {
      return ResponseService.notFound("Vote");
    }

    // Check if new room exists (if roomId is being updated)
    if (data.roomId) {
      const room = await prisma.room.findUnique({
        where: { id: data.roomId },
      });

      if (!room) {
        return ResponseService.notFound("Room");
      }
    }

    // Check for duplicate vote if roomId or name is being changed
    if (data.roomId || data.name) {
      const checkRoomId = data.roomId || existingVote.roomId;
      const checkName = data.name || existingVote.name;

      const duplicateVote = await prisma.vote.findFirst({
        where: {
          roomId: checkRoomId,
          name: checkName,
          NOT: { id },
        },
      });

      if (duplicateVote) {
        return ResponseService.conflict(
          "This name has already voted in this room"
        );
      }
    }

    const vote = await prisma.vote.update({
      where: { id },
      data,
      include: {
        room: {
          select: { id: true, roomName: true },
        },
      },
    });

    return ResponseService.success(vote, "Vote updated successfully");
  } catch (error) {
    console.error("Error updating vote:", error);
    return ResponseService.error("Failed to update vote");
  }
};

export const deleteVote = async (id: string) => {
  try {
    const existingVote = await prisma.vote.findUnique({
      where: { id },
      include: {
        room: {
          select: { id: true, roomName: true },
        },
      },
    });

    if (!existingVote) {
      return ResponseService.notFound("Vote");
    }

    await prisma.vote.delete({
      where: { id },
    });

    // Broadcast vote deletion to room channel
    const broadcastSuccess = await broadcastToRoom(
      existingVote.roomId,
      PUSHER_EVENTS.VOTE_DELETED,
      {
        voteId: id,
        vote: existingVote,
        timestamp: new Date().toISOString(),
      }
    );

    if (broadcastSuccess) {
      console.log(
        `Vote deletion broadcast successful for room ${existingVote.roomId}`
      );
    } else {
      console.warn(
        `Vote deletion broadcast failed for room ${existingVote.roomId}, clients will rely on polling`
      );
    }

    return ResponseService.success(null, "Vote deleted successfully");
  } catch (error) {
    console.error("Error deleting vote:", error);
    return ResponseService.error("Failed to delete vote");
  }
};
