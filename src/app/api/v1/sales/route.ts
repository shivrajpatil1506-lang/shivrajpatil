import { withApiAuth } from "@/lib/api-handler";
import { successResponse, serverErrorResponse } from "@/lib/api-response";
import { getApiRoleFilters } from "@/lib/api-rbac";
import { db } from "@/lib/db";

export const GET = withApiAuth(async (req, user) => {
  try {
    const { companyFilter } = getApiRoleFilters(user);
    
    let siteFilter = {};
    if (companyFilter.id) {
      siteFilter = { company_id: companyFilter.id };
    }

    const sales = await db.customerPurchase.findMany({
      where: {
        site: siteFilter
      },
      orderBy: { created_at: "desc" },
      include: {
        customer: {
          select: { first_name: true, last_name: true, mobile_1: true }
        },
        site: {
          select: { name: true }
        },
        unit: {
          select: { unit_number: true, property_type: true }
        }
      }
    });

    return successResponse(sales);
  } catch (error) {
    console.error("Failed to fetch sales API:", error);
    return serverErrorResponse(error);
  }
});
