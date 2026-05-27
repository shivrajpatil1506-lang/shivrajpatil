"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function initializeCompanyAccounting(companyId: string) {
  try {
    // 1. Create Default Currency (INR)
    let baseCurrency = await prisma.currency.findUnique({
      where: { company_id_code: { company_id: companyId, code: "INR" } },
    });

    if (!baseCurrency) {
      baseCurrency = await prisma.currency.create({
        data: {
          company_id: companyId,
          code: "INR",
          name: "Indian Rupee",
          symbol: "₹",
          is_base: true,
        },
      });
    }

    // 2. Create Base Voucher Types
    const voucherTypes = [
      { name: "Journal", code: "JRNL", base_type: "JOURNAL", prefix: "JRNL/", is_system: true },
      { name: "Contra", code: "CONT", base_type: "CONTRA", prefix: "CONT/", is_system: true },
      { name: "Receipt", code: "RCPT", base_type: "RECEIPT", prefix: "RCPT/", is_system: true },
      { name: "Payment", code: "PYMT", base_type: "PAYMENT", prefix: "PYMT/", is_system: true },
      { name: "Sales", code: "SALE", base_type: "SALES", prefix: "SALE/", is_system: true },
      { name: "Purchase", code: "PURC", base_type: "PURCHASE", prefix: "PURC/", is_system: true },
    ];

    for (const vt of voucherTypes) {
      await prisma.voucherType.upsert({
        where: { company_id_code: { company_id: companyId, code: vt.code } },
        update: {},
        create: {
          company_id: companyId,
          name: vt.name,
          code: vt.code,
          base_type: vt.base_type,
          prefix: vt.prefix,
          is_system: vt.is_system,
        },
      });
    }

    // 3. Create Default Tally Groups
    const groupHierarchy = [
      { name: "Capital Account", nature: "LIABILITIES" },
      { name: "Loans (Liability)", nature: "LIABILITIES" },
      { name: "Current Liabilities", nature: "LIABILITIES" },
      { name: "Fixed Assets", nature: "ASSETS" },
      { name: "Investments", nature: "ASSETS" },
      { name: "Current Assets", nature: "ASSETS" },
      { name: "Direct Income", nature: "INCOME", affects_gross_profit: true },
      { name: "Indirect Income", nature: "INCOME" },
      { name: "Direct Expenses", nature: "EXPENSES", affects_gross_profit: true },
      { name: "Indirect Expenses", nature: "EXPENSES" },
      { name: "Suspense Account", nature: "LIABILITIES" },
    ];

    for (const g of groupHierarchy) {
      await prisma.accountGroup.upsert({
        where: { company_id_name: { company_id: companyId, name: g.name } },
        update: {},
        create: {
          company_id: companyId,
          name: g.name,
          nature: g.nature,
          affects_gross_profit: g.affects_gross_profit || false,
          is_primary: true,
          is_system: true,
        },
      });
    }

    // Sub-groups
    const parentMap: Record<string, string> = {};
    const groups = await prisma.accountGroup.findMany({ where: { company_id: companyId } });
    groups.forEach((g) => { parentMap[g.name] = g.id; });

    const subGroups = [
      { name: "Reserves & Surplus", parent: "Capital Account", nature: "LIABILITIES" },
      { name: "Bank OD Accounts", parent: "Loans (Liability)", nature: "LIABILITIES" },
      { name: "Secured Loans", parent: "Loans (Liability)", nature: "LIABILITIES" },
      { name: "Unsecured Loans", parent: "Loans (Liability)", nature: "LIABILITIES" },
      { name: "Duties & Taxes", parent: "Current Liabilities", nature: "LIABILITIES" },
      { name: "Provisions", parent: "Current Liabilities", nature: "LIABILITIES" },
      { name: "Sundry Creditors", parent: "Current Liabilities", nature: "LIABILITIES" },
      { name: "Bank Accounts", parent: "Current Assets", nature: "ASSETS" },
      { name: "Cash-in-Hand", parent: "Current Assets", nature: "ASSETS" },
      { name: "Deposits (Asset)", parent: "Current Assets", nature: "ASSETS" },
      { name: "Loans & Advances (Asset)", parent: "Current Assets", nature: "ASSETS" },
      { name: "Stock-in-Hand", parent: "Current Assets", nature: "ASSETS" },
      { name: "Sundry Debtors", parent: "Current Assets", nature: "ASSETS" },
      { name: "Sales Accounts", parent: "Direct Income", nature: "INCOME", affects_gross_profit: true },
      { name: "Purchase Accounts", parent: "Direct Expenses", nature: "EXPENSES", affects_gross_profit: true },
    ];

    for (const sg of subGroups) {
      const parentId = parentMap[sg.parent];
      if (parentId) {
        await prisma.accountGroup.upsert({
          where: { company_id_name: { company_id: companyId, name: sg.name } },
          update: { parent_id: parentId },
          create: {
            company_id: companyId,
            name: sg.name,
            nature: sg.nature,
            parent_id: parentId,
            affects_gross_profit: sg.affects_gross_profit || false,
            is_primary: false,
            is_system: true,
          },
        });
      }
    }

    // Refresh groups for ledgers
    const allGroups = await prisma.accountGroup.findMany({ where: { company_id: companyId } });
    const getGroupId = (name: string) => allGroups.find(g => g.name === name)?.id;

    // 4. Create System Ledgers
    const systemLedgers = [
      { name: "Cash", group: "Cash-in-Hand", nature: "ASSETS" },
      { name: "Profit & Loss Account", group: "Capital Account", nature: "LIABILITIES" },
      { name: "CGST Payable", group: "Duties & Taxes", nature: "LIABILITIES" },
      { name: "SGST Payable", group: "Duties & Taxes", nature: "LIABILITIES" },
      { name: "IGST Payable", group: "Duties & Taxes", nature: "LIABILITIES" },
    ];

    for (const l of systemLedgers) {
      const gId = getGroupId(l.group);
      if (gId) {
        await prisma.ledger.upsert({
          where: { company_id_name: { company_id: companyId, name: l.name } },
          update: {},
          create: {
            company_id: companyId,
            name: l.name,
            group_id: gId,
            nature: l.nature,
            is_system: true,
          },
        });
      }
    }

    revalidatePath("/accounting/settings");
    return { success: true, message: "Company accounting initialized successfully." };
  } catch (error: any) {
    console.error("Failed to initialize company accounting:", error);
    return { success: false, error: error.message };
  }
}
