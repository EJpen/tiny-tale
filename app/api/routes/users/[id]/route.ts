import { NextRequest } from "next/server";
import {
  getUserById,
  updateUser,
  //deleteUser,
} from "../../../controllers/user.controller";
import { updateUserSchema, stringIdParamSchema } from "../../../core/utils";
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

  return await getUserById(id);
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

    // Validate body
    const bodyValidation = validateRequest<{
      username?: string;
    }>(updateUserSchema, body);
    if (!bodyValidation.isValid) {
      return ResponseService.badRequest(bodyValidation.errors);
    }

    return await updateUser(id, bodyValidation.data!);
  } catch (error) {
    return ResponseService.error("Invalid JSON in request body");
  }
}


//wip:
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;

//   const validation = validateRequest<{ id: string }>(stringIdParamSchema, {
//     id,
//   });
//   if (!validation.isValid) {
//     return ResponseService.badRequest(validation.errors);
//   }

//   return await deleteUser(id);
// }
