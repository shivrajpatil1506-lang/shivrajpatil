import { NextRequest, NextResponse } from "next/server";
import { AuthUser } from "@/lib/auth";
import { getApiUser } from "./api-auth";
import { unauthorizedResponse, serverErrorResponse } from "./api-response";

export type ApiHandlerContext = {
  params: Promise<Record<string, string>>;
};

type ProtectedApiHandler = (
  req: NextRequest,
  user: AuthUser,
  context?: ApiHandlerContext
) => Promise<NextResponse> | NextResponse;

type PublicApiHandler = (
  req: NextRequest,
  context?: ApiHandlerContext
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps an API route with authentication and error handling.
 * Injects the authenticated user into the handler.
 */
export function withApiAuth(handler: ProtectedApiHandler) {
  return async (req: NextRequest, context?: ApiHandlerContext) => {
    try {
      const user = await getApiUser(req);
      if (!user) {
        return unauthorizedResponse("Invalid or missing authentication token.");
      }
      return await handler(req, user, context);
    } catch (error) {
      return serverErrorResponse(error);
    }
  };
}

/**
 * Wraps a public API route with error handling.
 */
export function withPublicApi(handler: PublicApiHandler) {
  return async (req: NextRequest, context?: ApiHandlerContext) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return serverErrorResponse(error);
    }
  };
}
