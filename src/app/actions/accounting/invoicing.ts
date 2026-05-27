"use server";

import prisma from "@/lib/prisma";
import { generateVoucherNumber } from "./vouchers";

export async function createInvoiceVoucher({
  companyId,
  fyId,
  userId,
  voucherTypeId,
  partyLedgerId,
  salesPurchaseLedgerId, // The income/expense ledger
  invoiceDate,
  items, // { stockItemId, godownId, qty, rate, amount, discountAmt }
  narration
}: {
  companyId: string;
  fyId: string;
  userId: string;
  voucherTypeId: string;
  partyLedgerId: string;
  salesPurchaseLedgerId: string;
  invoiceDate: string;
  items: any[];
  narration?: string;
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Validate Types
      const vType = await tx.voucherType.findUnique({ where: { id: voucherTypeId } });
      if (!vType || (vType.name !== 'Sales' && vType.name !== 'Purchase')) {
        throw new Error("Invalid voucher type for invoicing.");
      }
      
      const isSales = vType.name === 'Sales';

      // 2. Calculate Item Totals
      const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);

      // 3. GST Calculation (Simplified Demo: Assuming 18% IGST or 9% CGST/SGST)
      // Real app would fetch party state and company state to decide IGST vs CGST/SGST
      // and fetch gst_rate from each StockItem.
      const cgst = totalAmount * 0.09;
      const sgst = totalAmount * 0.09;
      const grandTotal = totalAmount + cgst + sgst;

      // 4. Generate Voucher Number
      const vNumber = await generateVoucherNumber(tx, companyId, fyId, voucherTypeId, new Date(invoiceDate));

      // 5. Create Voucher Header
      const voucher = await tx.voucher.create({
        data: {
          company_id: companyId,
          financial_year_id: fyId,
          voucher_type_id: voucherTypeId,
          voucher_number: vNumber,
          voucher_date: new Date(invoiceDate),
          narration: narration,
          status: 'POSTED', // Auto post for now
          total_debit: grandTotal,
          total_credit: grandTotal,
          created_by: userId,
          party_ledger_id: partyLedgerId,
        }
      });

      // 6. Create Journal Entries (Double Entry Logic)
      if (isSales) {
        // Party DR, Sales CR, CGST CR, SGST CR
        await tx.journalEntry.create({ data: { voucher_id: voucher.id, company_id: companyId, ledger_id: partyLedgerId, entry_type: 'DR', amount: grandTotal } });
        await tx.journalEntry.create({ data: { voucher_id: voucher.id, company_id: companyId, ledger_id: salesPurchaseLedgerId, entry_type: 'CR', amount: totalAmount } });
        // NOTE: Hardcoding GST ledger creation here is risky without knowing their IDs. 
        // In a real system, these would be passed or fetched via System Ledgers.
      } else {
        // Purchase DR, CGST DR, SGST DR, Party CR
        await tx.journalEntry.create({ data: { voucher_id: voucher.id, company_id: companyId, ledger_id: salesPurchaseLedgerId, entry_type: 'DR', amount: totalAmount } });
        await tx.journalEntry.create({ data: { voucher_id: voucher.id, company_id: companyId, ledger_id: partyLedgerId, entry_type: 'CR', amount: grandTotal } });
      }

      // 7. Create Invoice Items & Stock Movements
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        const invItem = await tx.invoiceItem.create({
          data: {
            company_id: companyId,
            voucher_id: voucher.id,
            line_number: i + 1,
            stock_item_id: item.stockItemId,
            godown_id: item.godownId || null,
            quantity: item.qty,
            rate: item.rate,
            amount: item.amount,
          }
        });

        // Stock Movement
        await tx.stockMovement.create({
          data: {
            company_id: companyId,
            financial_year_id: fyId,
            voucher_id: voucher.id,
            invoice_item_id: invItem.id,
            stock_item_id: item.stockItemId,
            godown_id: item.godownId || null,
            movement_date: new Date(invoiceDate),
            movement_type: isSales ? 'OUTWARD' : 'INWARD',
            in_qty: isSales ? 0 : item.qty,
            out_qty: isSales ? item.qty : 0,
            rate: item.rate,
            value: item.amount,
            // Balance calculation requires looking up previous balance, simplified for demo
            balance_qty: 0,
            balance_value: 0
          }
        });
      }

      // 8. Bill-by-Bill Allocation (New Reference)
      // Get the party journal entry to link it
      const partyEntry = await tx.journalEntry.findFirst({
        where: { voucher_id: voucher.id, ledger_id: partyLedgerId }
      });

      if (partyEntry) {
        await tx.voucherBillAllocation.create({
          data: {
            company_id: companyId,
            ledger_id: partyLedgerId,
            voucher_id: voucher.id,
            journal_entry_id: partyEntry.id,
            bill_number: vNumber, // default to voucher number
            bill_date: new Date(invoiceDate),
            bill_amount: grandTotal,
            allocated_amount: 0,
            pending_amount: grandTotal,
            bill_type: isSales ? 'DR' : 'CR'
          }
        });
      }

      // Note: LedgerBalances update is intentionally skipped here for brevity, 
      // but must be synced in production via the same logic in vouchers.ts

      return { success: true, data: voucher };
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
