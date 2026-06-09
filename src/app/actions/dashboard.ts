"use server";

import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

// Internal functions to fetch from DB
async function fetchAdminMetrics() {
  try {
    const [incomeAggr, expenseAggr, activeSites] = await Promise.all([
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { category: { in: ["INSTALMENT_RECEIVED", "BOOKING_AMOUNT", "PROPERTY_SALE", "OTHER_INCOME"] } }
      }),
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { category: { in: ["SALARY", "PURCHASE", "PETTY_EXPENSE", "CONTRACTOR_PAYMENT", "UTILITY_EXPENSE", "OTHER_EXPENSE"] } }
      }),
      db.site.count({ where: { status: 'active' } })
    ]);

    const totalIncome = incomeAggr._sum.amount || 0;
    const totalExpense = expenseAggr._sum.amount || 0;

    return {
      revenue: totalIncome,
      expenses: totalExpense,
      activeProjects: activeSites,
      cashBalance: totalIncome - totalExpense,
    };
  } catch (error) {
    console.error("Failed to fetch admin metrics", error);
    return { revenue: 0, expenses: 0, activeProjects: 0, cashBalance: 0 };
  }
}

async function fetchAccountantMetrics() {
  try {
    const [incomeAggr, expenseAggr, pendingApprovals] = await Promise.all([
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { category: { in: ["INSTALMENT_RECEIVED", "BOOKING_AMOUNT", "PROPERTY_SALE", "OTHER_INCOME"] } }
      }),
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { category: { in: ["SALARY", "PURCHASE", "PETTY_EXPENSE", "CONTRACTOR_PAYMENT", "UTILITY_EXPENSE", "OTHER_EXPENSE"] } }
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
      _sum: { total_agreement_value: true }
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
        where: { status: 'active' }
      }),
      db.employee.count({ where: { status: 'active' } }),
      db.employee.count({ where: { status: 'active', portal_role: 'agent' } })
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
  { revalidate: 60, tags: ['dashboard'] }
);

export const getAccountantMetrics = unstable_cache(
  fetchAccountantMetrics,
  ['accountant-dashboard-metrics'],
  { revalidate: 60, tags: ['dashboard'] }
);

export const getAgentMetrics = unstable_cache(
  fetchAgentMetrics,
  ['agent-dashboard-metrics'],
  { revalidate: 60, tags: ['dashboard'] }
);

export const getHRMetrics = unstable_cache(
  fetchHRMetrics,
  ['hr-dashboard-metrics'],
  { revalidate: 60, tags: ['dashboard'] }
);
