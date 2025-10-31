import { NextResponse } from "next/server";

// A standard success response structure
const sendSuccess = <T>(
  data: T,
  message: string = "Success",
  statusCode: number = 200
) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status: statusCode }
  );
};

// A standard error response structure
const sendError = (
  message: string = "An unexpected error occurred",
  statusCode: number = 500,
  details: unknown = null
) => {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        details,
      },
    },
    { status: statusCode }
  );
};

// Specific helper for 404 Not Found errors
const sendNotFound = (resource: string = "Resource") => {
  return sendError(`${resource} not found.`, 404);
};

// Specific helper for 409 Conflict errors
const sendConflict = (message: string) => {
  return sendError(message, 409);
};

// Specific helper for 400 Bad Request errors (often for validation)
const sendBadRequest = (details: any) => {
  return sendError("Invalid request data provided.", 400, details);
};

// Specific helper for 401 Unauthorized errors
const sendUnauthorized = (message: string = "Unauthorized access") => {
  return sendError(message, 401);
};

// Specific helper for 403 Forbidden errors
const sendForbidden = (message: string = "Access forbidden") => {
  return sendError(message, 403);
};

// Specific helper for 422 Unprocessable Entity errors (validation errors)
const sendValidationError = (details: any) => {
  return sendError("Validation failed.", 422, details);
};

// Export all functions as a single object for easy importing
export const ResponseService = {
  success: sendSuccess,
  error: sendError,
  notFound: sendNotFound,
  conflict: sendConflict,
  badRequest: sendBadRequest,
  unauthorized: sendUnauthorized,
  forbidden: sendForbidden,
  validationError: sendValidationError,
};
