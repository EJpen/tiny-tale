import { NextRequest } from "next/server";
import {
  getVoteById,
  updateVote,
  deleteVote,
} from "../../../controllers/vote.controller";
import { updateVoteSchema, stringIdParamSchema } from "../../../core/utils";
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

  return await getVoteById(id);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log("PATCH vote ID:", id);
    console.log("PATCH body:", body);

    // Validate ID
    const idValidation = validateRequest<{ id: string }>(stringIdParamSchema, {
      id,
    });
    if (!idValidation.isValid) {
      return ResponseService.badRequest(idValidation.errors);
    }

    // Validate body
    const bodyValidation = validateRequest<{
      roomId?: string;
      name?: string;
      gender?: string;
      isOut?: boolean;
    }>(updateVoteSchema, body);
    if (!bodyValidation.isValid) {
      return ResponseService.badRequest(bodyValidation.errors);
    }

    return await updateVote(id, bodyValidation.data!);
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

  return await deleteVote(id);
}
