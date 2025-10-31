import { NextRequest } from "next/server";
import {
  getRoomById,
  updateRoom,
  deleteRoom,
} from "../../../controllers/room.controller";
import { updateRoomSchema, stringIdParamSchema } from "../../../core/utils";
import { ResponseService } from "../../../core/services/response.service";
import { validateRequest } from "../../../lib/helpers/validation.helper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const validation = validateRequest<{ id: string }>(stringIdParamSchema, {
    id,
  });
  if (!validation.isValid) {
    return ResponseService.badRequest(validation.errors);
  }

  return await getRoomById(id);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate ID
    const idValidation = validateRequest<{ id: string }>(stringIdParamSchema, {
      id,
    });
    if (!idValidation.isValid) {
      return ResponseService.badRequest(idValidation.errors);
    }

    const bodyValidation = validateRequest<{
      trusteeId?: string;
      roomName?: string;
      gender?: string;
    }>(updateRoomSchema, body);
    if (!bodyValidation.isValid) {
      return ResponseService.badRequest(bodyValidation.errors);
    }

    return await updateRoom(id, bodyValidation.data!);
  } catch (error) {
    return ResponseService.error("Invalid JSON in request body");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const validation = validateRequest<{ id: string }>(stringIdParamSchema, {
    id,
  });
  if (!validation.isValid) {
    return ResponseService.badRequest(validation.errors);
  }

  return await deleteRoom(id);
}
