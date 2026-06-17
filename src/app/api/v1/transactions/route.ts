import { withApiAuth } from "@/lib/api-handler";
import { successResponse, serverErrorResponse } from "@/lib/api-response";
import { getApiRoleFilters } from "@/lib/api-rbac";
import { db } from "@/lib/db";

export const GET = withApiAuth(async (req, user) => {
  try {
    const { relatedFilter } = getApiRoleFilters(user);
    
    const transactions = await db.transaction.findMany({
      where: { is_deleted: false, ...relatedFilter },
      orderBy: { transaction_date: 'desc' },
      include: {
        company: { select: { name: true, short_name: true } },
        customer: { select: { first_name: true, last_name: true } },
        employee: { select: { first_name: true, last_name: true } }
      }
    });

    const formattedTransactions = transactions.map((t) => ({
      ...t,
      company_name: t.company?.short_name || t.company?.name || "N/A",
      customer_name: t.customer ? `${t.customer.first_name} ${t.customer.last_name}` : null,
      employee_name: t.employee ? `${t.employee.first_name} ${t.employee.last_name}` : null,
      added_by_name: "Admin" // Placeholder for auth user
    }));

    return successResponse(formattedTransactions);
  } catch (error) {
    console.error("Failed to fetch transactions API:", error);
    return serverErrorResponse(error);
  }
});
