import { NextRequest } from "next/server";
import { createRoom, getRooms } from "../../controllers/room.controller";
import { createRoomSchema, paginationQuerySchema } from "../../core/utils";
import { ResponseService } from "../../core/services/response.service";
import { validateRequest } from "../../lib/helpers/validation.helper";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const queryParams = Object.fromEntries(searchParams);
  const validation = validateRequest(paginationQuerySchema, queryParams);

  if (!validation.isValid) {
    return ResponseService.badRequest(validation.errors);
  }

  return await getRooms();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateRequest<{
      trusteeId: string;
      roomName: string;
      gender: string;
    }>(createRoomSchema, body);

    if (!validation.isValid) {
      return ResponseService.badRequest(validation.errors);
    }

    return await createRoom(validation.data!);
  } catch (error) {
    return ResponseService.error("Invalid JSON in request body");
  }
}
