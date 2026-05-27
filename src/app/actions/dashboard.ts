"use server";

import { db } from "@/lib/db";

// Metrics for Admin Dashboard
export async function getAdminMetrics() {
  try {
    const transactions = await db.transaction.findMany();
    
    const totalIncome = transactions
      .filter(t => ["INSTALMENT_RECEIVED", "BOOKING_AMOUNT", "PROPERTY_SALE", "OTHER_INCOME"].includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = transactions
      .filter(t => ["SALARY", "PURCHASE", "PETTY_EXPENSE", "CONTRACTOR_PAYMENT", "UTILITY_EXPENSE", "OTHER_EXPENSE"].includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);

    const activeSites = await db.site.count({ where: { status: 'active' } });
    
    // Simplistic mock data mixing with real totals for demo purposes
    // A real app would aggregate this by month/category via Prisma grouping
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
    const transactions = await db.transaction.findMany();
    
    const totalIncome = transactions
      .filter(t => ["INSTALMENT_RECEIVED", "BOOKING_AMOUNT", "PROPERTY_SALE", "OTHER_INCOME"].includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = transactions
      .filter(t => ["SALARY", "PURCHASE", "PETTY_EXPENSE", "CONTRACTOR_PAYMENT", "UTILITY_EXPENSE", "OTHER_EXPENSE"].includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingApprovals = await db.approvalRequest.count({ where: { status: 'pending' } });
    
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
    const purchases = await db.customerPurchase.findMany();
    
    const target = 50000000;
    const achieved = purchases.reduce((sum, p) => sum + p.total_agreement_value, 0);
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
    const employees = await db.employee.findMany({ where: { status: 'active' } });
    
    const totalEmployees = employees.length;
    const monthlySalary = employees.reduce((sum, e) => sum + (e.gross_salary || 0), 0);
    const pendingLeaves = 3; // Placeholder
    
    return {
      totalEmployees,
      activeAgents: employees.filter(e => e.portal_role === "agent").length,
      monthlySalary,
      pendingLeaves,
    };
  } catch (error) {
    console.error("Failed to fetch HR metrics", error);
    return { totalEmployees: 0, activeAgents: 0, monthlySalary: 0, pendingLeaves: 0 };
  }
}
