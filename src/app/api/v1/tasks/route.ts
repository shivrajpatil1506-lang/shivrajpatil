import { NextRequest } from "next/server";
import { withApiAuth } from "@/lib/api-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTasks } from "@/app/actions/tasks";

// Handler for GET /api/v1/tasks
async function getTasksHandler(req: NextRequest, user: any) {
  try {
    const tasks = await getTasks();
    return successResponse(tasks);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export const GET = withApiAuth(getTasksHandler);

