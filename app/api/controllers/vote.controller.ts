import { supabaseAdmin } from "../../../lib/supabase-admin";
import { ResponseService } from "../core/services/response.service";
import { broadcastToRoom, PUSHER_EVENTS } from "../../../lib/pusher";

export const getVotes = async (filters?: {
  roomId?: string;
  name?: string;
  gender?: string;
  isOut?: boolean;
}) => {
  try {
    let query = supabaseAdmin
      .from("votes")
      .select(
        `
        id,
        roomId,
        name,
        gender,
        isOut,
        createdAt,
        updatedAt
      `
      )
      .order("createdAt", { ascending: false });

    if (filters?.roomId) query = query.eq("roomId", filters.roomId);
    if (filters?.name) query = query.eq("name", filters.name);
    if (filters?.gender) query = query.eq("gender", filters.gender);
    if (filters?.isOut !== undefined) query = query.eq("isOut", filters.isOut);

    const { data: votes, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return ResponseService.error("Failed to fetch votes");
    }

    return ResponseService.success(votes, "Votes fetched successfully");
  } catch (error) {
    console.error("Error fetching votes:", error);
    return ResponseService.error("Failed to fetch votes");
  }
};

export const getVoteById = async (id: string) => {
  try {
    const { data: vote, error } = await supabaseAdmin
      .from("votes")
      .select(
        `
        *,
        room:rooms!roomId(id, roomName)
      `
      )
      .eq("id", id)
      .single();

    if (error || !vote) {
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
    const { data: room } = await supabaseAdmin
      .from("rooms")
      .select("id, isClose")
      .eq("id", roomId)
      .single();

    if (!room) {
      return ResponseService.notFound("Room");
    }

    // Check if name already voted in this room
    const { data: existingVote } = await supabaseAdmin
      .from("votes")
      .select("id")
      .eq("roomId", roomId)
      .eq("name", name)
      .single();

    if (room.isClose) {
      return ResponseService.conflict("Room is closed for voting");
    }

    if (existingVote) {
      return ResponseService.conflict(
        "This name has already voted in this room"
      );
    }

    const { data: vote, error } = await supabaseAdmin
      .from("votes")
      .insert({
        roomId,
        name,
        gender,
        isOut,
      })
      .select(
        `
        *,
        room:rooms!roomId(id, roomName)
      `
      )
      .single();

    if (error) {
      console.error("Supabase error creating vote:", error);
      return ResponseService.error("Failed to create vote");
    }

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
    const { data: existingVote } = await supabaseAdmin
      .from("votes")
      .select("*")
      .eq("id", id)
      .single();

    if (!existingVote) {
      return ResponseService.notFound("Vote");
    }

    // Check if new room exists (if roomId is being updated)
    if (data.roomId) {
      const { data: room } = await supabaseAdmin
        .from("rooms")
        .select("id")
        .eq("id", data.roomId)
        .single();

      if (!room) {
        return ResponseService.notFound("Room");
      }
    }

    // Check for duplicate vote if roomId or name is being changed
    if (data.roomId || data.name) {
      const checkRoomId = data.roomId || existingVote.roomId;
      const checkName = data.name || existingVote.name;

      const { data: duplicateVote } = await supabaseAdmin
        .from("votes")
        .select("id")
        .eq("roomId", checkRoomId)
        .eq("name", checkName)
        .neq("id", id)
        .single();

      if (duplicateVote) {
        return ResponseService.conflict(
          "This name has already voted in this room"
        );
      }
    }

    const { data: vote, error } = await supabaseAdmin
      .from("votes")
      .update(data)
      .eq("id", id)
      .select(
        `
        *,
        room:rooms!roomId(id, roomName)
      `
      )
      .single();

    if (error) {
      console.error("Supabase error updating vote:", error);
      return ResponseService.error("Failed to update vote");
    }

    return ResponseService.success(vote, "Vote updated successfully");
  } catch (error) {
    console.error("Error updating vote:", error);
    return ResponseService.error("Failed to update vote");
  }
};

export const deleteVote = async (id: string) => {
  try {
    const { data: existingVote } = await supabaseAdmin
      .from("votes")
      .select(
        `
        *,
        room:rooms!roomId(id, roomName)
      `
      )
      .eq("id", id)
      .single();

    if (!existingVote) {
      return ResponseService.notFound("Vote");
    }

    const { error } = await supabaseAdmin.from("votes").delete().eq("id", id);

    if (error) {
      console.error("Supabase error deleting vote:", error);
      return ResponseService.error("Failed to delete vote");
    }

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
