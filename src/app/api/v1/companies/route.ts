import { withApiAuth } from "@/lib/api-handler";
import { successResponse, serverErrorResponse } from "@/lib/api-response";
import { getApiRoleFilters, hasRole } from "@/lib/api-rbac";
import { db } from "@/lib/db";

export const GET = withApiAuth(async (req, user) => {
  // Only admins and agents might need company info, or HR.
  // Actually, accountants and HR also need it. Let's just let anyone authenticated see it,
  // but filtered by their RBAC role.
  try {
    const { companyFilter } = getApiRoleFilters(user);
    
    const companies = await db.company.findMany({
      where: { is_deleted: false, ...companyFilter },
      orderBy: { created_at: "desc" },
      include: {
        _count: {
          select: { sites: true, employees: true },
        },
      },
    });

    return successResponse(companies);
  } catch (error) {
    console.error("Failed to fetch companies API:", error);
    return serverErrorResponse(error);
  }
});
