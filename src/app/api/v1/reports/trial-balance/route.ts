import { NextRequest } from "next/server";
import { withApiAuth } from "@/lib/api-handler";
import { successResponse, serverErrorResponse } from "@/lib/api-response";
import { getApiRoleFilters } from "@/lib/api-rbac";
import { db } from "@/lib/db";

export const GET = withApiAuth(async (req: NextRequest, user) => {
  try {
    const { companyFilter } = getApiRoleFilters(user);
    if (!companyFilter.id) {
      return successResponse({ entries: [], total_debit: 0, total_credit: 0 });
    }

    const balances = await db.ledgerBalance.findMany({
      where: { company_id: companyFilter.id },
    });

    const ledgerIds = balances.map((b) => b.ledger_id);
    const ledgers = await db.ledger.findMany({
      where: { id: { in: ledgerIds } },
      select: { id: true, name: true, nature: true },
    });

    const ledgerMap = new Map(ledgers.map((l) => [l.id, l]));

    let totalDebit = 0;
    let totalCredit = 0;

    const entries = balances.map((b) => {
      const l = ledgerMap.get(b.ledger_id);
      const dr = Number(b.closing_dr);
      const cr = Number(b.closing_cr);

      totalDebit += dr;
      totalCredit += cr;

      return {
        ledger: l?.name || "Unknown",
        nature: l?.nature || "Unknown",
        debit: dr,
        credit: cr,
      };
    });

    return successResponse({
      entries,
      total_debit: totalDebit,
      total_credit: totalCredit,
    });
  } catch (error) {
    console.error(error);
    return serverErrorResponse(error);
  }
});
