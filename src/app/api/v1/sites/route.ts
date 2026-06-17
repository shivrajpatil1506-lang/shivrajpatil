import { NextRequest } from "next/server";
import { withApiAuth } from "@/lib/api-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getSites } from "@/app/actions/sites";

// Handler for GET /api/v1/sites
async function getSitesHandler(req: NextRequest, user: any) {
  try {
    const sites = await getSites();
    return successResponse(sites);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export const GET = withApiAuth(getSitesHandler);

