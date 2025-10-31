import { z } from "zod";

// Common schemas
export const stringIdParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
});

// User schemas
export const createUserSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username too long"),
});

export const updateUserSchema = createUserSchema.partial();

// Room schemas
export const createRoomSchema = z.object({
  trusteeId: z.string().min(1, "Trustee ID is required"),
  roomName: z
    .string()
    .min(1, "Room name is required")
    .max(100, "Room name too long"),
  gender: z.enum(["male", "female", "mixed"], {
    message: "Gender must be male, female, or mixed",
  }),
});

export const updateRoomSchema = createRoomSchema.partial();

// Vote schemas
export const createVoteSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  gender: z.enum(["male", "female"], {
    message: "Gender must be male or female",
  }),
  isOut: z.boolean(),
});

export const updateVoteSchema = createVoteSchema.partial();

// Query schemas
export const roomQuerySchema = z.object({
  trusteeId: z.string().optional(),
  gender: z.enum(["male", "female", "mixed"]).optional(),
});

export const voteQuerySchema = z.object({
  roomId: z.string().optional(),
  name: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  isOut: z
    .string()
    .optional()
    .transform((val) => (val ? val === "true" : undefined)),
});

// Pin verification schema
export const verifyPinSchema = z.object({
  pin: z.string().length(4, "Pin must be exactly 4 digits"),
});

// Close/Reopen room schema
export const closeRoomSchema = z.object({
  isClose: z.boolean().optional(),
});
