import { NextRequest } from "next/server";
import { VerifyPinController } from "../../../../controllers/verify-pin.controller";
import { validateRequest } from "../../../../lib/helpers/validation.helper";
import { verifyPinSchema } from "../../../../core/utils/schemas";
import { ResponseService } from "../../../../core/services/response.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();

    const validation = validateRequest(verifyPinSchema, body);
    if (!validation.isValid) {
      return ResponseService.badRequest(validation.errors);
    }

    const { pin } = validation.data as { pin: string };

    return VerifyPinController.verifyPin(pin, { params });
  } catch (error) {
    console.error("Error in verify pin route:", error);
    return ResponseService.error("Failed to process request");
  }
}
