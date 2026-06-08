"use server";

import { db } from "@/lib/db";

// Metrics for Admin Dashboard
export async function getAdminMetrics() {
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

    // Simplistic mock data mixing with real totals for demo purposes
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

// Metrics for Accountant Dashboard
export async function getAccountantMetrics() {
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
      todaysCollection: totalIncome * 0.1, // mock logic for "today"
      pendingPayments: totalExpense * 0.2, // mock logic for "pending"
      bankBalance: totalIncome - totalExpense,
      pendingApprovals,
    };
  } catch (error) {
    console.error("Failed to fetch accountant metrics", error);
    return { todaysCollection: 0, pendingPayments: 0, bankBalance: 0, pendingApprovals: 0 };
  }
}

// Metrics for Agent Dashboard
export async function getAgentMetrics() {
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

// Metrics for HR Dashboard
export async function getHRMetrics() {
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
