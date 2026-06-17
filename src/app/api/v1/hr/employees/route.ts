import { NextRequest } from "next/server";
import { withApiAuth } from "@/lib/api-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getEmployees } from "@/app/actions/employees";

// Handler for GET /api/v1/hr/employees
async function getEmployeesHandler(req: NextRequest, user: any) {
  try {
    const employees = await getEmployees();
    return successResponse(employees);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export const GET = withApiAuth(getEmployeesHandler);

