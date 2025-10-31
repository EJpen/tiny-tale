import { NextRequest } from "next/server";
import { closeRoom } from "../../../../controllers/room.controller";
import { stringIdParamSchema } from "../../../../core/utils";
import { ResponseService } from "../../../../core/services/response.service";
import { validateRequest } from "../../../../lib/helpers/validation.helper";
import { closeRoomSchema } from "../../../../core/utils/schemas";

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

    // Validate body
    const bodyValidation = validateRequest<{ isClose?: boolean }>(
      closeRoomSchema,
      body
    );
    if (!bodyValidation.isValid) {
      return ResponseService.badRequest(bodyValidation.errors);
    }

    return await closeRoom(id, bodyValidation.data!);
  } catch (error) {
    console.error("Error in close room route:", error);
    return ResponseService.error("Invalid JSON in request body");
  }
}
