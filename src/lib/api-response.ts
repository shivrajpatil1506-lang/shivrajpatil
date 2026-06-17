import { NextResponse } from "next/server";
import { PaginationMeta } from "./types";

export function successResponse<T>(data: T, meta?: PaginationMeta, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status }
  );
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

export function unauthorizedResponse(message = "Unauthorized") {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = "Forbidden") {
  return errorResponse(message, 403);
}

export function serverErrorResponse(error: unknown) {
  console.error("API Server Error:", error);
  const message = error instanceof Error ? error.message : "Internal server error";
  return errorResponse(message, 500);
}
