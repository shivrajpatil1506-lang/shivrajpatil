import { NextRequest } from "next/server";
import { withApiAuth } from "@/lib/api-handler";
import { successResponse, serverErrorResponse } from "@/lib/api-response";
import { getApiRoleFilters } from "@/lib/api-rbac";
import { db } from "@/lib/db";

export const GET = withApiAuth(async (req: NextRequest, user) => {
  try {
    const { companyFilter } = getApiRoleFilters(user);
    if (!companyFilter.id) {
      return successResponse([]); 
    }

    const vouchers = await db.voucher.findMany({
      where: { company_id: companyFilter.id },
      orderBy: { voucher_date: 'desc' },
      take: 50,
      include: {
        voucher_type: {
          select: { name: true }
        },
        party_ledger: {
          select: { name: true }
        },
        journal_entries: {
          include: {
            ledger: {
              select: { name: true }
            }
          }
        }
      }
    });

    return successResponse(vouchers);
  } catch (error) {
    console.error(error);
    return serverErrorResponse(error);
  }
});
