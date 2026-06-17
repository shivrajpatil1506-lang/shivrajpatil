"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUnreconciledBankLines(companyId: string) {
  try {
    // Find all bank groups (Group name contains "Bank")
    const bankGroups = await prisma.accountGroup.findMany({
      where: {
        company_id: companyId,
        name: {
          contains: "Bank",
          mode: "insensitive"
        }
      }
    });

    const bankGroupIds = bankGroups.map(g => g.id);

    // Find all bank ledgers
    const bankLedgers = await prisma.ledger.findMany({
      where: {
        company_id: companyId,
        group_id: { in: bankGroupIds }
      }
    });

    const bankLedgerIds = bankLedgers.map(l => l.id);

    // Fetch journal entries for these ledgers that are NOT reconciled
    // and belong to POSTED vouchers
    const entries = await prisma.journalEntry.findMany({
      where: {
        company_id: companyId,
        ledger_id: { in: bankLedgerIds },
        is_reconciled: false,
        voucher: {
          status: "POSTED"
        }
      },
      include: {
        voucher: true,
        ledger: true,
      },
      orderBy: {
        voucher: {
          voucher_date: "asc"
        }
      }
    });

    // Map to a simpler format for UI
    return entries.map(entry => ({
      id: entry.id,
      voucher_number: entry.voucher.voucher_number,
      voucher_date: entry.voucher.voucher_date.toISOString(),
      ledger_name: entry.ledger.name,
      amount: Number(entry.amount),
      entry_type: entry.entry_type,
      narration: entry.narration || entry.voucher.narration,
    }));

  } catch (error) {
    console.error("Failed to fetch bank lines:", error);
    return [];
  }
}

export async function reconcileBankLine(
  entryId: string, 
  bankDate: Date, 
  bankTxnId?: string
) {
  try {
    const updated = await prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        is_reconciled: true,
        reconciled_at: new Date(),
        bank_date: bankDate,
        bank_transaction_id: bankTxnId || null,
      }
    });

    revalidatePath("/accounting/reconciliation");
    return { success: true, entry: updated };
  } catch (error: any) {
    console.error("Failed to reconcile line:", error);
    return { success: false, error: error.message };
  }
}
