import { NextRequest } from "next/server";
import { createVote, getVotes } from "../../controllers/vote.controller";
import { createVoteSchema, voteQuerySchema } from "../../core/utils";
import { ResponseService } from "../../core/services/response.service";
import { validateRequest } from "../../lib/helpers/validation.helper";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get all votes with filters
  const queryParams = Object.fromEntries(searchParams);
  const validation = validateRequest<{
    roomId?: string;
    name?: string;
    gender?: string;
    isOut?: boolean;
  }>(voteQuerySchema, queryParams);

  if (!validation.isValid) {
    return ResponseService.badRequest(validation.errors);
  }

  return await getVotes(validation.data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateRequest<{
      roomId: string;
      name: string;
      gender: string;
      isOut: boolean;
    }>(createVoteSchema, body);

    if (!validation.isValid) {
      return ResponseService.badRequest(validation.errors);
    }

    return await createVote(validation.data!);
  } catch (error) {
    return ResponseService.error("Invalid JSON in request body");
  }
}
