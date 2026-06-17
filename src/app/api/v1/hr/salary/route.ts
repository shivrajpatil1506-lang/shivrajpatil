import { NextRequest } from "next/server";
import { withApiAuth } from "@/lib/api-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { getRoleFilters } from "@/lib/rbac";

// Handler for GET /api/v1/hr/salary
async function getSalaryTransactionsHandler(req: NextRequest, user: any) {
  try {
    const { relatedFilter } = await getRoleFilters();
    
    const transactions = await db.transaction.findMany({
      where: { 
        is_deleted: false, 
        category: "SALARY",
        ...relatedFilter 
      },
      orderBy: { transaction_date: 'desc' },
      include: {
        company: { select: { name: true, short_name: true } },
        employee: { select: { first_name: true, last_name: true, employee_code: true } }
      }
    });

    const formatted = transactions.map((t: any) => ({
      ...t,
      company_name: t.company?.short_name || t.company?.name || "N/A",
      employee_name: t.employee ? `${t.employee.first_name} ${t.employee.last_name}` : null,
      employee_code: t.employee?.employee_code || null,
    }));

    return successResponse(formatted);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export const GET = withApiAuth(getSalaryTransactionsHandler);

