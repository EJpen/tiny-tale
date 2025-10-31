import { NextRequest } from "next/server";
import { createUser, getUsers } from "../../controllers/user.controller";
import { createUserSchema, paginationQuerySchema } from "../../core/utils";
import { ResponseService } from "../../core/services/response.service";
import { validateRequest } from "../../lib/helpers/validation.helper";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const queryParams = Object.fromEntries(searchParams);
  const validation = validateRequest<{ page?: number; limit?: number }>(
    paginationQuerySchema,
    queryParams
  );

  if (!validation.isValid) {
    return ResponseService.badRequest(validation.errors);
  }

  return await getUsers(validation.data?.page, validation.data?.limit);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateRequest<{ username: string }>(
      createUserSchema,
      body
    );

    if (!validation.isValid) {
      return ResponseService.badRequest(validation.errors);
    }

    return await createUser(validation.data!.username);
  } catch (error) {
    return ResponseService.error("Invalid JSON in request body");
  }
}
