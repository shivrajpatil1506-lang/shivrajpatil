"use server";

import prisma from "@/lib/prisma";

/**
 * Helper to build the hierarchy
 */
async function buildGroupHierarchy(companyId: string) {
  const groups = await prisma.accountGroup.findMany({
    where: { company_id: companyId, deleted_at: null },
    orderBy: { sequence_no: "asc" }
  });

  const ledgers = await prisma.ledger.findMany({
    where: { company_id: companyId, deleted_at: null },
  });

  // Map to easily find children
  const groupMap = new Map();
  groups.forEach(g => {
    groupMap.set(g.id, { ...g, children: [], ledgers: [] });
  });

  ledgers.forEach(l => {
    const parentGroup = groupMap.get(l.group_id);
    if (parentGroup) {
      parentGroup.ledgers.push(l);
    }
  });

  const rootGroups: any[] = [];

  groupMap.forEach(g => {
    if (g.parent_id) {
      const parent = groupMap.get(g.parent_id);
      if (parent) {
        parent.children.push(g);
      }
    } else {
      rootGroups.push(g);
    }
  });

  return { rootGroups, groupMap };
}

/**
 * Generate Trial Balance
 */
export async function generateTrialBalance(companyId: string, fyId: string) {
  try {
    const { rootGroups, groupMap } = await buildGroupHierarchy(companyId);

    const balances = await prisma.ledgerBalance.findMany({
      where: { company_id: companyId, financial_year_id: fyId }
    });

    const balanceMap = new Map();
    balances.forEach(b => balanceMap.set(b.ledger_id, b));

    // Recursive function to calculate balances upwards
    const calculateGroupBalance = (groupNode: any) => {
      let totalDr = 0;
      let totalCr = 0;

      // Sum ledgers
      groupNode.ledgers.forEach((l: any) => {
        const bal = balanceMap.get(l.id);
        const dr = bal ? Number(bal.closing_dr) : 0;
        const cr = bal ? Number(bal.closing_cr) : 0;
        
        l.closing_dr = dr;
        l.closing_cr = cr;
        
        totalDr += dr;
        totalCr += cr;
      });

      // Sum children
      groupNode.children.forEach((child: any) => {
        const childBal = calculateGroupBalance(child);
        totalDr += childBal.dr;
        totalCr += childBal.cr;
      });

      // Net off at the group level for display (optional, but standard for TB)
      if (totalDr > totalCr) {
        groupNode.closing_dr = totalDr - totalCr;
        groupNode.closing_cr = 0;
      } else {
        groupNode.closing_cr = totalCr - totalDr;
        groupNode.closing_dr = 0;
      }

      return { dr: groupNode.closing_dr, cr: groupNode.closing_cr };
    };

    let grandTotalDr = 0;
    let grandTotalCr = 0;

    rootGroups.forEach(root => {
      const bal = calculateGroupBalance(root);
      grandTotalDr += bal.dr;
      grandTotalCr += bal.cr;
    });

    return { 
      success: true, 
      data: {
        tree: rootGroups,
        grandTotalDr,
        grandTotalCr
      }
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate Profit & Loss
 */
export async function generateProfitAndLoss(companyId: string, fyId: string) {
  try {
    const tb = await generateTrialBalance(companyId, fyId);
    if (!tb.success) throw new Error(tb.error);

    const rootGroups = tb.data?.tree || [];
    
    const incomeGroups = rootGroups.filter((g: any) => g.nature === "INCOME");
    const expenseGroups = rootGroups.filter((g: any) => g.nature === "EXPENSES");

    let totalIncome = 0;
    let totalExpense = 0;

    incomeGroups.forEach((g: any) => {
      totalIncome += (g.closing_cr || 0) - (g.closing_dr || 0);
    });

    expenseGroups.forEach((g: any) => {
      totalExpense += (g.closing_dr || 0) - (g.closing_cr || 0);
    });

    const netProfit = totalIncome - totalExpense;

    return {
      success: true,
      data: {
        income: incomeGroups,
        expenses: expenseGroups,
        totalIncome,
        totalExpense,
        netProfit
      }
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate Balance Sheet
 */
export async function generateBalanceSheet(companyId: string, fyId: string) {
  try {
    const tb = await generateTrialBalance(companyId, fyId);
    if (!tb.success) throw new Error(tb.error);

    const pl = await generateProfitAndLoss(companyId, fyId);
    if (!pl.success) throw new Error(pl.error);

    const rootGroups = tb.data?.tree || [];
    const netProfit = pl.data?.netProfit || 0;
    
    const assetGroups = rootGroups.filter((g: any) => g.nature === "ASSETS");
    const liabilityGroups = rootGroups.filter((g: any) => g.nature === "LIABILITIES");

    let totalAssets = 0;
    let totalLiabilities = 0;

    assetGroups.forEach((g: any) => {
      totalAssets += (g.closing_dr || 0) - (g.closing_cr || 0);
    });

    liabilityGroups.forEach((g: any) => {
      totalLiabilities += (g.closing_cr || 0) - (g.closing_dr || 0);
    });

    // Add Net Profit to Liabilities (or reduce if Net Loss)
    totalLiabilities += netProfit;

    return {
      success: true,
      data: {
        assets: assetGroups,
        liabilities: liabilityGroups,
        totalAssets,
        totalLiabilities,
        netProfit
      }
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export const getTrialBalance = generateTrialBalance;
