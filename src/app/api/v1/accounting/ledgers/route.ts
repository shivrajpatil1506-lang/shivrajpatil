import { NextRequest } from "next/server";
import { withApiAuth } from "@/lib/api-handler";
import { successResponse, serverErrorResponse } from "@/lib/api-response";
import { getApiRoleFilters } from "@/lib/api-rbac";
import { db } from "@/lib/db";

export const GET = withApiAuth(async (req: NextRequest, user) => {
  try {
    const { companyFilter } = getApiRoleFilters(user);
    if (!companyFilter.id) {
      return successResponse([]); // Or handle missing company properly
    }

    const balances = await db.ledgerBalance.findMany({
      where: { company_id: companyFilter.id },
    });

    if (!balances.length) return successResponse([]);

    const ledgerIds = balances.map((b) => b.ledger_id);
    const ledgers = await db.ledger.findMany({
      where: { id: { in: ledgerIds } },
      select: { id: true, name: true, nature: true, alias: true },
    });

    const ledgerMap = new Map(ledgers.map((l) => [l.id, l]));

    const formatted = balances
      .map((b) => {
        const l = ledgerMap.get(b.ledger_id);
        return {
          id: b.id,
          ledger_id: b.ledger_id,
          name: l?.name || "Unknown",
          nature: l?.nature || "Unknown",
          closing_dr: Number(b.closing_dr),
          closing_cr: Number(b.closing_cr),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return successResponse(formatted);
  } catch (error) {
    console.error(error);
    return serverErrorResponse(error);
  }
});
