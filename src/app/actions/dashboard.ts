"use server";

import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

// Internal functions to fetch from DB
async function fetchAdminMetrics() {
  try {
    const currentYear = new Date().getFullYear();
    const [transactions, activeSites, purchases] = await Promise.all([
      db.transaction.findMany({
        where: { 
          is_deleted: false,
          transaction_date: {
            gte: new Date(`${currentYear}-01-01`),
            lte: new Date(`${currentYear}-12-31`)
          }
        },
        select: { amount: true, category: true, transaction_date: true }
      }),
      db.site.count({ where: { status: 'active', is_deleted: false } }),
      db.customerPurchase.findMany({
        where: { status: "active" },
        include: {
          site: { select: { name: true } },
          instalments: { select: { amount_due: true, amount_received: true, status: true } }
        }
      })
    ]);

    const incomeCategories = ["INSTALMENT_RECEIVED", "BOOKING_AMOUNT", "PROPERTY_SALE", "OTHER_INCOME"];
    const expenseCategories = ["SALARY", "PURCHASE", "PETTY_EXPENSE", "CONTRACTOR_PAYMENT", "UTILITY_EXPENSE", "OTHER_EXPENSE"];

    let totalIncome = 0;
    let totalExpense = 0;

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(0, i).toLocaleString('default', { month: 'short' }),
      revenue: 0,
      expenses: 0
    }));

    const categoryMap: Record<string, number> = {};

    transactions.forEach(t => {
      const month = t.transaction_date.getMonth();
      if (incomeCategories.includes(t.category)) {
        totalIncome += t.amount;
        monthlyData[month].revenue += t.amount;
      } else if (expenseCategories.includes(t.category)) {
        totalExpense += t.amount;
        monthlyData[month].expenses += t.amount;
      }

      if (incomeCategories.includes(t.category)) {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      }
    });

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
      .sort((a, b) => b.value - a.value);

    // Instalment Status logic
    const siteStatusMap: Record<string, { name: string; collected: number; pending: number; overdue: number }> = {};

    purchases.forEach(p => {
      const siteName = p.site?.name || "Unknown Site";
      if (!siteStatusMap[siteName]) {
        siteStatusMap[siteName] = { name: siteName, collected: 0, pending: 0, overdue: 0 };
      }

      p.instalments.forEach(inst => {
        siteStatusMap[siteName].collected += inst.amount_received || 0;
        const pending = (inst.amount_due || 0) - (inst.amount_received || 0);
        if (inst.status === "overdue") {
          siteStatusMap[siteName].overdue += pending;
        } else if (pending > 0) {
          siteStatusMap[siteName].pending += pending;
        }
      });
    });

    const instalmentStatus = Object.values(siteStatusMap);

    return {
      revenue: totalIncome,
      expenses: totalExpense,
      activeProjects: activeSites,
      cashBalance: totalIncome - totalExpense,
      monthlyRevenueExpense: monthlyData,
      categoryBreakdown,
      instalmentStatus
    };
  } catch (error) {
    console.error("Failed to fetch admin metrics", error);
    return { 
      revenue: 0, expenses: 0, activeProjects: 0, cashBalance: 0, 
      monthlyRevenueExpense: [], categoryBreakdown: [], instalmentStatus: [] 
    };
  }
}

async function fetchAccountantMetrics() {
  try {
    const [incomeAggr, expenseAggr, pendingApprovals] = await Promise.all([
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { category: { in: ["INSTALMENT_RECEIVED", "BOOKING_AMOUNT", "PROPERTY_SALE", "OTHER_INCOME"] }, is_deleted: false }
      }),
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { category: { in: ["SALARY", "PURCHASE", "PETTY_EXPENSE", "CONTRACTOR_PAYMENT", "UTILITY_EXPENSE", "OTHER_EXPENSE"] }, is_deleted: false }
      }),
      db.approvalRequest.count({ where: { status: 'pending' } })
    ]);

    const totalIncome = incomeAggr._sum.amount || 0;
    const totalExpense = expenseAggr._sum.amount || 0;
    
    return {
      todaysCollection: totalIncome * 0.1,
      pendingPayments: totalExpense * 0.2,
      bankBalance: totalIncome - totalExpense,
      pendingApprovals,
    };
  } catch (error) {
    console.error("Failed to fetch accountant metrics", error);
    return { todaysCollection: 0, pendingPayments: 0, bankBalance: 0, pendingApprovals: 0 };
  }
}

async function fetchAgentMetrics() {
  try {
    const purchasesAggr = await db.customerPurchase.aggregate({
      _sum: { total_agreement_value: true },
      where: { status: "active" }
    });
    
    const target = 50000000;
    const achieved = purchasesAggr._sum.total_agreement_value || 0;
    const activeLeads = 12; // Placeholder
    
    return {
      monthlyTarget: target,
      achieved: achieved,
      activeLeads,
      collections: achieved * 0.3, // Mock collections
    };
  } catch (error) {
    console.error("Failed to fetch agent metrics", error);
    return { monthlyTarget: 0, achieved: 0, activeLeads: 0, collections: 0 };
  }
}

async function fetchHRMetrics() {
  try {
    const [employeeAggr, totalEmployees, activeAgents] = await Promise.all([
      db.employee.aggregate({
        _sum: { gross_salary: true },
        where: { status: 'active', is_deleted: false }
      }),
      db.employee.count({ where: { status: 'active', is_deleted: false } }),
      db.employee.count({ where: { status: 'active', portal_role: 'agent', is_deleted: false } })
    ]);
    
    const monthlySalary = employeeAggr._sum.gross_salary || 0;
    const pendingLeaves = 3; // Placeholder
    
    return {
      totalEmployees,
      activeAgents,
      monthlySalary,
      pendingLeaves,
    };
  } catch (error) {
    console.error("Failed to fetch HR metrics", error);
    return { totalEmployees: 0, activeAgents: 0, monthlySalary: 0, pendingLeaves: 0 };
  }
}

// Export cached versions
export const getAdminMetrics = unstable_cache(
  fetchAdminMetrics,
  ['admin-dashboard-metrics'],
  { revalidate: 300, tags: ['dashboard'] }
);

export const getAccountantMetrics = unstable_cache(
  fetchAccountantMetrics,
  ['accountant-dashboard-metrics'],
  { revalidate: 300, tags: ['dashboard'] }
);

export const getAgentMetrics = unstable_cache(
  fetchAgentMetrics,
  ['agent-dashboard-metrics'],
  { revalidate: 300, tags: ['dashboard'] }
);

export const getHRMetrics = unstable_cache(
  fetchHRMetrics,
  ['hr-dashboard-metrics'],
  { revalidate: 300, tags: ['dashboard'] }
);
