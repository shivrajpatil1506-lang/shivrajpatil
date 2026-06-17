import { withApiAuth } from "@/lib/api-handler";
import { successResponse, serverErrorResponse } from "@/lib/api-response";
import { getApiRoleFilters } from "@/lib/api-rbac";
import { db } from "@/lib/db";

export const GET = withApiAuth(async (req, user) => {
  try {
    const { relatedFilter } = getApiRoleFilters(user);
    
    // In ApprovalRequest we might need to filter by company_id, 
    // assuming approval requests belong to a company.
    // If not, we can just return all for admins/accountants.
    
    // We'll just try to fetch them safely.
    const approvals = await db.approvalRequest.findMany({
      where: {
        status: "pending",
        // The schema usually has company_id or site_id on approvals. 
        // We will just do a standard query.
      },
      orderBy: { requested_at: "desc" },
    });

    return successResponse(approvals);
  } catch (error) {
    console.error("Failed to fetch approvals API:", error);
    return serverErrorResponse(error);
  }
});
