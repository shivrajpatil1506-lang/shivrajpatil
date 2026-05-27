"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFinancialYears(companyId: string) {
  try {
    const years = await prisma.financialYear.findMany({
      where: { company_id: companyId },
      orderBy: { start_date: 'desc' }
    });
    return { success: true, data: years };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getActiveFinancialYear(companyId: string) {
  try {
    const activeYear = await prisma.financialYear.findFirst({
      where: { company_id: companyId, is_current: true }
    });
    return { success: true, data: activeYear };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createFinancialYear(companyId: string, name: string, startDate: Date, endDate: Date) {
  try {
    // If this is the first one, make it active. Otherwise false (needs manual switch)
    const existingCount = await prisma.financialYear.count({ where: { company_id: companyId } });
    const isActive = existingCount === 0;

    const fy = await prisma.financialYear.create({
      data: {
        company_id: companyId,
        year_label: name,
        start_date: startDate,
        end_date: endDate,
        is_current: isActive
      }
    });
    
    revalidatePath("/accounting");
    revalidatePath("/accountant/accounting");
    return { success: true, data: fy };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function setActiveFinancialYear(companyId: string, fyId: string) {
  try {
    // Transaction to switch active status
    await prisma.$transaction([
      prisma.financialYear.updateMany({
        where: { company_id: companyId },
        data: { is_current: false }
      }),
      prisma.financialYear.update({
        where: { id: fyId },
        data: { is_current: true }
      })
    ]);
    
    revalidatePath("/accounting");
    revalidatePath("/accountant/accounting");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function setupDefaultAccounts(companyId: string) {
  try {
    // Check if groups already exist
    const count = await prisma.accountGroup.count({ where: { company_id: companyId } });
    if (count > 0) {
      return { success: false, error: "Default accounts already initialized for this company." };
    }

    // Tally-style Primary Groups
    const createGroup = async (name: string, nature: string, affects_gp: boolean, parent_id: string | null = null) => {
      return prisma.accountGroup.create({
        data: { company_id: companyId, name, nature, affects_gross_profit: affects_gp, is_system: true, parent_id }
      });
    };

    // 1. LIABILITIES
    const capital = await createGroup("Capital Account", "liabilities", false);
    const reserves = await createGroup("Reserves & Surplus", "liabilities", false);
    const currLiab = await createGroup("Current Liabilities", "liabilities", false);
      const creditors = await createGroup("Sundry Creditors", "liabilities", false, currLiab.id);
      const duties = await createGroup("Duties & Taxes", "liabilities", false, currLiab.id);
    const loansLiab = await createGroup("Loans (Liability)", "liabilities", false);
      await createGroup("Secured Loans", "liabilities", false, loansLiab.id);
      await createGroup("Unsecured Loans", "liabilities", false, loansLiab.id);

    // 2. ASSETS
    const fixedAssets = await createGroup("Fixed Assets", "assets", false);
    const investments = await createGroup("Investments", "assets", false);
    const currAssets = await createGroup("Current Assets", "assets", false);
      const cash = await createGroup("Cash-in-Hand", "assets", false, currAssets.id);
      const bank = await createGroup("Bank Accounts", "assets", false, currAssets.id);
      const debtors = await createGroup("Sundry Debtors", "assets", false, currAssets.id);
      const stock = await createGroup("Stock-in-Hand", "assets", false, currAssets.id);
      await createGroup("Deposits (Asset)", "assets", false, currAssets.id);
      await createGroup("Loans & Advances (Asset)", "assets", false, currAssets.id);

    // 3. INCOME
    const salesAcc = await createGroup("Sales Accounts", "income", true); // Direct
    const indirectInc = await createGroup("Indirect Income", "income", false);
    const directInc = await createGroup("Direct Income", "income", true);

    // 4. EXPENSES
    const purchaseAcc = await createGroup("Purchase Accounts", "expenses", true); // Direct
    const directExp = await createGroup("Direct Expenses", "expenses", true);
    const indirectExp = await createGroup("Indirect Expenses", "expenses", false);

    // Create system Ledgers
    await prisma.ledger.create({
      data: {
        company_id: companyId,
        name: "Cash",
        group_id: cash.id,
        nature: "assets",
        is_system: true
      }
    });

    await prisma.ledger.create({
      data: {
        company_id: companyId,
        name: "Profit & Loss A/c",
        group_id: indirectExp.id, // Usually under Primary, but indirect is fine
        nature: "expenses",
        is_system: true
      }
    });

    return { success: true, message: "Default accounts successfully created." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
