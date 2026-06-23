"use server";

import { db } from "@/lib/db";
import { Customer } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { unstable_cache, revalidateTag } from "next/cache";

async function fetchCustomers() {
  try {
    const customers = await db.customer.findMany({
      where: { is_deleted: false },
      orderBy: { added_at: "desc" },
      include: {
        purchases: {
          include: {
            site: { select: { name: true } },
            unit: { select: { unit_number: true, property_type: true } }
          }
        },
        transactions: {
          where: { category: "PROPERTY_SALE", status: "completed" }
        }
      }
    });
    return customers;
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return [];
  }
}

export const getCustomers = unstable_cache(
  fetchCustomers,
  ['customers-list'],
  { revalidate: 300, tags: ['customers'] }
);

export async function getCustomersForSelect() {
  try {
    const customers = await db.customer.findMany({
      where: { is_deleted: false },
      orderBy: { first_name: "asc" },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        mobile_1: true,
      }
    });
    return customers;
  } catch (error) {
    console.error("Failed to fetch customers for select:", error);
    return [];
  }
}

async function fetchCustomersForUserId(employeeId: string) {
  try {
    const customers = await db.customer.findMany({
      where: { 
        is_deleted: false,
        added_by: employeeId
      },
      orderBy: { added_at: "desc" },
      include: {
        purchases: {
          include: {
            site: { select: { name: true } },
            unit: { select: { unit_number: true, property_type: true } }
          }
        },
        transactions: {
          where: { category: "PROPERTY_SALE", status: "completed" }
        }
      }
    });
    return customers;
  } catch (error) {
    console.error("Failed to fetch agent customers:", error);
    return [];
  }
}

const getCachedCustomersForUserId = unstable_cache(
  fetchCustomersForUserId,
  ['customers-by-user'],
  { revalidate: 300, tags: ['customers'] }
);

export async function getCustomersForCurrentUser() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.employee_id) return [];
    
    return getCachedCustomersForUserId(user.employee_id);
  } catch (error) {
    console.error("Failed to get current user for customers:", error);
    return [];
  }
}

async function fetchCustomerWithDetails(id: string) {
  try {
    const customer = await db.customer.findUnique({
      where: { id, is_deleted: false },
      include: {
        purchases: {
          include: {
            site: true,
            unit: true,
            company: { select: { name: true } },
          }
        },
        transactions: {
          orderBy: { transaction_date: "desc" }
        }
      }
    });
    return customer;
  } catch (error) {
    console.error(`Failed to fetch customer details with id ${id}:`, error);
    return null;
  }
}

export const getCustomerWithDetails = unstable_cache(
  fetchCustomerWithDetails,
  ['customer-with-details'],
  { revalidate: 300, tags: ['customers'] }
);

export async function createCustomerWithPurchase(formData: any) {
  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Create Customer
      const customer = await tx.customer.create({
        data: {
          first_name: formData.firstName,
          middle_name: formData.middleName || null,
          last_name: formData.lastName,
          mobile_1: formData.mobile1,
          mobile_2: formData.mobile2 || null,
          email: formData.email || null,
          gender: formData.gender || null,
          aadhaar_encrypted: formData.aadhaar,
          pan_number: formData.pan,
          current_address: {
            addressLine: formData.addressLine,
            city: formData.city,
            state: formData.state,
            pin: formData.pin,
          },
          added_by: "agent-id-placeholder", // In real app, from session
        }
      });

      // 2. Create Purchase
      const purchase = await tx.customerPurchase.create({
        data: {
          customer_id: customer.id,
          company_id: formData.companyId,
          site_id: formData.siteId,
          booking_date: new Date(formData.bookingDate),
          payment_plan: formData.paymentPlan,
          total_agreement_value: Number(formData.totalAmount),
          booking_amount: Number(formData.bookingAmount),
          num_instalments: Number(formData.noOfInstalments || 1),
          status: "active",
          notes: formData.notes,
        }
      });

      // 3. Optional: Create initial transaction for booking amount
      if (Number(formData.bookingAmount) > 0) {
         await tx.transaction.create({
           data: {
             transaction_code: `TXN-${Date.now()}`,
             company_id: formData.companyId,
             site_id: formData.siteId,
             customer_id: customer.id,
             category: "PROPERTY_SALE",
             transaction_date: new Date(formData.bookingDate),
             amount: Number(formData.bookingAmount),
             payment_mode: "bank_transfer",
             added_by: "system",
           }
         });
      }

      return customer;
    });
    
    revalidateTag('customers', 'default' as any);
    revalidateTag('transactions', 'default' as any); // Because a transaction is created
    return { success: true, customer: result };
  } catch (error: any) {
    console.error("Failed to create customer:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  const updated = await db.customer.update({
    where: { id },
    data: data as any,
  });
  revalidateTag('customers', 'default' as any);
  return updated;
}

export async function deleteCustomer(id: string) {
  try {
    const customer = await db.customer.update({
      where: { id },
      data: { is_deleted: true }
    });
    revalidateTag("customers", "default" as any);
    return { success: true, customer };
  } catch (error: any) {
    console.error("Failed to delete customer:", error);
    return { success: false, error: error.message };
  }
}

export async function quickCreateCustomer(data: {
  first_name: string;
  last_name: string;
  mobile_1: string;
}) {
  try {
    const user = await getCurrentUser();
    
    const customer = await db.customer.create({
      data: {
        ...data,
        added_by: user?.employee_id || null,
      }
    });
    
    revalidateTag("customers", "default" as any);
    return { success: true, customer };
  } catch (error: any) {
    console.error("Failed to quick create customer:", error);
    return { success: false, error: error.message };
  }
}
