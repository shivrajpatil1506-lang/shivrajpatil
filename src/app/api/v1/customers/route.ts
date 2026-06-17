import { withApiAuth } from "@/lib/api-handler";
import { successResponse, serverErrorResponse } from "@/lib/api-response";
import { getApiRoleFilters } from "@/lib/api-rbac";
import { db } from "@/lib/db";

export const GET = withApiAuth(async (req, user) => {
  try {
    const { companyFilter } = getApiRoleFilters(user);
    
    // An agent should probably only see their own customers, or all customers in their company?
    // Let's assume PRD allows seeing customers for the company they belong to for now, or assigned customers.
    // We will just filter by company ID.
    
    let whereClause: any = { is_deleted: false };
    
    if (companyFilter.id) {
      whereClause.customer_purchases = {
        some: {
          site: {
            company_id: companyFilter.id
          }
        }
      };
    }

    const customers = await db.customer.findMany({
      where: whereClause,
      orderBy: { added_at: "desc" },
      include: {
        purchases: {
          include: {
            site: {
              select: { name: true }
            },
            unit: {
              select: { unit_number: true }
            }
          }
        }
      }
    });

    return successResponse(customers);
  } catch (error) {
    console.error("Failed to fetch customers API:", error);
    return serverErrorResponse(error);
  }
});
