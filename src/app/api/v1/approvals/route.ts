import { NextRequest } from "next/server";
import { withApiAuth } from "@/lib/api-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getApprovals } from "@/app/actions/approvals";

// Handler for GET /api/v1/approvals
async function getApprovalsHandler(req: NextRequest, user: any) {
  try {
    const approvals = await getApprovals();
    return successResponse(approvals);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export const GET = withApiAuth(getApprovalsHandler);

