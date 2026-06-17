"use server";

import { db } from "@/lib/db";
import { Prisma, Transaction } from "@prisma/client";
import { getRoleFilters } from "@/lib/rbac";
import { unstable_cache, revalidateTag } from "next/cache";

export async function createTransaction(formData: any) {
  try {
    const amount = parseFloat(formData.amount);
    
    // Validate inputs
    if (!formData.companyId || !formData.category || !amount || amount <= 0) {
      throw new Error("Missing or invalid required fields");
    }

    const transaction = await db.transaction.create({
      data: {
        transaction_code: `TXN-${Date.now()}`,
        company_id: formData.companyId,
        site_id: formData.siteId || null,
        customer_id: formData.customerId || null,
        category: formData.category, // E.g., PROPERTY_SALE, BOOKING_AMOUNT, etc
        sub_category: formData.description || null,
        transaction_date: formData.transactionDate ? new Date(formData.transactionDate) : new Date(),
        amount: amount,
        payment_mode: formData.paymentMode || "bank_transfer",
        reference_no: formData.referenceNo || null,
        notes: formData.description || null,
        added_by: "accountant-id", // placeholder
      }
    });

    revalidateTag('transactions', 'default');
    return { success: true, transaction };
  } catch (error: any) {
    console.error("Failed to create transaction:", error);
    return { success: false, error: error.message };
  }
}

async function fetchTransactions(relatedFilter: any) {
  try {
    const transactions = await db.transaction.findMany({
      where: { is_deleted: false, ...relatedFilter },
      orderBy: { transaction_date: 'desc' },
      include: {
        company: { select: { name: true, short_name: true } },
        customer: { select: { first_name: true, last_name: true } },
        employee: { select: { first_name: true, last_name: true } }
      }
    });

    // Map to plain objects and format names for the frontend
    return transactions.map((t: any) => ({
      ...t,
      company_name: t.company?.short_name || t.company?.name || "N/A",
      customer_name: t.customer ? `${t.customer.first_name} ${t.customer.last_name}` : null,
      employee_name: t.employee ? `${t.employee.first_name} ${t.employee.last_name}` : null,
      added_by_name: "Admin" // Placeholder for auth user
    }));
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

const getCachedTransactions = unstable_cache(
  fetchTransactions,
  ['transactions-list'],
  { revalidate: 300, tags: ['transactions'] }
);

export async function getTransactions() {
  const { relatedFilter } = await getRoleFilters();
  return getCachedTransactions(relatedFilter);
}

async function fetchTransactionById(id: string) {
  try {
    const transaction = await db.transaction.findUnique({
      where: { id },
      include: {
        company: { select: { name: true, short_name: true } },
        customer: { select: { first_name: true, last_name: true } },
        employee: { select: { first_name: true, last_name: true } }
      }
    });

    if (!transaction) return null;

    return {
      ...transaction,
      company_name: (transaction as any).company?.short_name || (transaction as any).company?.name || "N/A",
      customer_name: (transaction as any).customer ? `${(transaction as any).customer.first_name} ${(transaction as any).customer.last_name}` : null,
      employee_name: (transaction as any).employee ? `${(transaction as any).employee.first_name} ${(transaction as any).employee.last_name}` : null,
      added_by_name: "Admin"
    };
  } catch (error) {
    console.error(`Failed to fetch transaction with id ${id}:`, error);
    return null;
  }
}

export const getTransactionById = unstable_cache(
  fetchTransactionById,
  ['transaction-by-id'],
  { revalidate: 300, tags: ['transactions'] }
);

export async function updateTransaction(id: string, data: Partial<Transaction>) {
  const updated = await db.transaction.update({
    where: { id },
    data: data as any,
  });
  revalidateTag('transactions', 'default');
  return updated;
}

export async function deleteTransaction(id: string) {
  try {
    await db.transaction.update({
      where: { id },
      data: { status: "cancelled" }
    });
    revalidateTag('transactions', 'default');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete transaction:", error);
    return { success: false, error: error.message };
  }
}

import { getCurrentUser } from "@/lib/auth";

async function fetchTransactionsForUserId(employeeId: string) {
  try {
    const transactions = await db.transaction.findMany({
      where: { 
        added_by: employeeId
      },
      orderBy: { transaction_date: "desc" },
      include: {
        company: { select: { name: true, short_name: true } },
        customer: { select: { first_name: true, middle_name: true, last_name: true } }
      }
    });

    return transactions.map(txn => ({
      ...txn,
      company_name: txn.company?.short_name || txn.company?.name || "Unknown",
      customer_name: txn.customer 
        ? [txn.customer.first_name, txn.customer.middle_name, txn.customer.last_name].filter(Boolean).join(" ") 
        : null
    }));
  } catch (error) {
    console.error("Failed to fetch agent transactions:", error);
    return [];
  }
}

const getCachedTransactionsForUserId = unstable_cache(
  fetchTransactionsForUserId,
  ['transactions-current-user'],
  { revalidate: 300, tags: ['transactions'] }
);

export async function getTransactionsForCurrentUser() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.employee_id) return [];
    
    return getCachedTransactionsForUserId(user.employee_id);
  } catch (error) {
    console.error("Failed to fetch agent transactions:", error);
    return [];
  }
}
