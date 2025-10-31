import { NextRequest } from "next/server";
import { getRoomByIdPublic } from "../../../../controllers/room.controller";
import { stringIdParamSchema } from "../../../../core/utils";
import { ResponseService } from "../../../../core/services/response.service";
import { validateRequest } from "../../../../lib/helpers/validation.helper";

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

  return await getRoomByIdPublic(id);
}
