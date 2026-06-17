import { NextRequest } from "next/server";
import { withApiAuth } from "@/lib/api-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { db } from "@/lib/db";

// Handler for GET /api/v1/sites/[id]/units
async function getSiteUnitsHandler(req: NextRequest, user: any, context: any) {
  try {
    // Await params as required in newer Next.js versions
    const params = await context.params;
    const siteId = params.id;
    
    if (!siteId) {
      return errorResponse("Site ID is required", 400);
    }

    const units = await db.siteUnit.findMany({
      where: { site_id: siteId },
      orderBy: { unit_number: 'asc' },
    });

    return successResponse(units);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export const GET = withApiAuth(getSiteUnitsHandler);
