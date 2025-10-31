import { supabaseAdmin } from "../../../lib/supabase-admin";
import { ResponseService } from "../core/services/response.service";
import crypto from "crypto";

export class VerifyPinController {
  static async verifyPin(
    pin: string,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;

      const { data: room, error } = await supabaseAdmin
        .from("rooms")
        .select("id, ownerPin, gender")
        .eq("id", id)
        .single();

      if (error || !room) {
        return ResponseService.notFound("Room");
      }

      const hashedPin = crypto.createHash("sha256").update(pin).digest("hex");

      if (hashedPin !== room.ownerPin) {
        return ResponseService.badRequest("Invalid pin");
      }

      return ResponseService.success(
        {
          verified: true,
          gender: room.gender,
        },
        "Pin verified successfully"
      );
    } catch (error) {
      console.error("Error verifying pin:", error);
      return ResponseService.error("Failed to verify pin");
    }
  }
}
