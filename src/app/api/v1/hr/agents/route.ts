import { NextRequest } from "next/server";
import { withApiAuth } from "@/lib/api-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getAgents } from "@/app/actions/employees";

// Handler for GET /api/v1/hr/agents
async function getAgentsHandler(req: NextRequest, user: any) {
  try {
    const agents = await getAgents();
    return successResponse(agents);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export const GET = withApiAuth(getAgentsHandler);

