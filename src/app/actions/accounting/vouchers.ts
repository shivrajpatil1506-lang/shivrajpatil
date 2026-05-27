"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type JournalEntryInput = {
  ledger_id: string;
  entry_type: "DR" | "CR";
  amount: number;
  narration?: string;
  cost_centre_id?: string;
};

export async function generateVoucherNumber(tx: any, companyId: string, fyId: string, voucherTypeId: string, voucherDate: Date) {
  const vType = await tx.voucherType.findUnique({ where: { id: voucherTypeId } });
  if (!vType) throw new Error("Invalid Voucher Type");

  let voucherNumber = "";
  if (vType.numbering_method === "AUTO") {
    const nextNum = vType.last_number + 1;
    voucherNumber = `${vType.prefix || ""}${nextNum}${vType.suffix || ""}`;
    
    await tx.voucherType.update({
      where: { id: vType.id },
      data: { last_number: nextNum },
    });
  } else {
    voucherNumber = `MANUAL-${Date.now()}`; // Placeholder for manual
  }
  return voucherNumber;
}

export async function createVoucher(data: {
  company_id: string;
  financial_year_id: string;
  voucher_type_id: string;
  voucher_date: Date;
  reference_number?: string;
  party_ledger_id?: string;
  narration?: string;
  entries: JournalEntryInput[];
}, userId: string = "system") {
  try {
    // 1. Validate DR = CR
    let totalDr = 0;
    let totalCr = 0;
    data.entries.forEach(e => {
      if (e.entry_type === "DR") totalDr += e.amount;
      if (e.entry_type === "CR") totalCr += e.amount;
    });

    if (Math.abs(totalDr - totalCr) > 0.01) {
      throw new Error(`Voucher is unbalanced. Total Debit: ${totalDr}, Total Credit: ${totalCr}`);
    }

    // 2. Generate Voucher Number
    const voucherNumber = await generateVoucherNumber(prisma, data.company_id, data.financial_year_id, data.voucher_type_id, data.voucher_date);

    // 3. Create Voucher Transaction
    const voucher = await prisma.voucher.create({
      data: {
        company_id: data.company_id,
        financial_year_id: data.financial_year_id,
        voucher_type_id: data.voucher_type_id,
        voucher_number: voucherNumber,
        voucher_date: data.voucher_date,
        reference_number: data.reference_number,
        party_ledger_id: data.party_ledger_id,
        narration: data.narration,
        total_debit: totalDr,
        total_credit: totalCr,
        status: "DRAFT",
        created_by: userId,
        journal_entries: {
          create: data.entries.map((e, index) => ({
            company_id: data.company_id,
            ledger_id: e.ledger_id,
            entry_type: e.entry_type,
            amount: e.amount,
            narration: e.narration,
            cost_centre_id: e.cost_centre_id,
            line_sequence: index + 1,
          })),
        },
      },
      include: {
        journal_entries: true,
      },
    });

    revalidatePath("/accounting/vouchers");
    return { success: true, data: voucher };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function postVoucher(voucherId: string, userId: string) {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId },
      include: { journal_entries: true },
    });

    if (!voucher) throw new Error("Voucher not found");
    if (voucher.status === "POSTED") throw new Error("Voucher is already posted");
    if (voucher.status === "CANCELLED") throw new Error("Cannot post a cancelled voucher");

    // Perform balance updates in a transaction
    await prisma.$transaction(async (tx) => {
      for (const entry of voucher.journal_entries) {
        const balance = await tx.ledgerBalance.findUnique({
          where: {
            company_id_financial_year_id_ledger_id: {
              company_id: voucher.company_id,
              financial_year_id: voucher.financial_year_id,
              ledger_id: entry.ledger_id,
            }
          }
        });

        if (balance) {
          const updateData: any = {};
          if (entry.entry_type === "DR") {
            updateData.period_dr = { increment: entry.amount };
            updateData.closing_dr = { increment: entry.amount };
          } else {
            updateData.period_cr = { increment: entry.amount };
            updateData.closing_cr = { increment: entry.amount };
          }

          await tx.ledgerBalance.update({
            where: { id: balance.id },
            data: updateData,
          });
        } else {
          // Create balance record if it doesn't exist
          await tx.ledgerBalance.create({
            data: {
              company_id: voucher.company_id,
              financial_year_id: voucher.financial_year_id,
              ledger_id: entry.ledger_id,
              period_dr: entry.entry_type === "DR" ? entry.amount : 0,
              period_cr: entry.entry_type === "CR" ? entry.amount : 0,
              closing_dr: entry.entry_type === "DR" ? entry.amount : 0,
              closing_cr: entry.entry_type === "CR" ? entry.amount : 0,
            }
          });
        }
      }

      await tx.voucher.update({
        where: { id: voucherId },
        data: {
          status: "POSTED",
          posted_at: new Date(),
          posted_by: userId,
        },
      });
      
      await tx.accountingAuditLog.create({
        data: {
          company_id: voucher.company_id,
          table_name: "vouchers",
          record_id: voucher.id,
          action: "POST",
          performed_by: userId,
        }
      });
    });

    revalidatePath("/accounting/vouchers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function cancelVoucher(voucherId: string, userId: string, reason: string) {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId },
      include: { journal_entries: true },
    });

    if (!voucher) throw new Error("Voucher not found");
    if (voucher.status === "CANCELLED") throw new Error("Voucher is already cancelled");

    await prisma.$transaction(async (tx) => {
      // If it was posted, reverse the balances
      if (voucher.status === "POSTED") {
        for (const entry of voucher.journal_entries) {
          const updateData: any = {};
          if (entry.entry_type === "DR") {
            updateData.period_dr = { decrement: entry.amount };
            updateData.closing_dr = { decrement: entry.amount };
          } else {
            updateData.period_cr = { decrement: entry.amount };
            updateData.closing_cr = { decrement: entry.amount };
          }

          await tx.ledgerBalance.update({
            where: {
              company_id_financial_year_id_ledger_id: {
                company_id: voucher.company_id,
                financial_year_id: voucher.financial_year_id,
                ledger_id: entry.ledger_id,
              }
            },
            data: updateData,
          });
        }
      }

      await tx.voucher.update({
        where: { id: voucherId },
        data: {
          status: "CANCELLED",
          cancelled_at: new Date(),
          cancelled_by: userId,
          cancel_reason: reason,
        },
      });
      
      await tx.accountingAuditLog.create({
        data: {
          company_id: voucher.company_id,
          table_name: "vouchers",
          record_id: voucher.id,
          action: "CANCEL",
          performed_by: userId,
        }
      });
    });

    revalidatePath("/accounting/vouchers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
