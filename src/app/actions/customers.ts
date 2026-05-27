"use server";

import { db } from "@/lib/db";
import { Customer } from "@prisma/client";

export async function getCustomers() {
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

import { getCurrentUser } from "@/lib/auth";

export async function getCustomersForCurrentUser() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.employee_id) return [];
    
    // In a real app we would filter by agent_id or added_by
    // Currently Prisma schema has added_by as string, so we can filter by that.
    // If not set up, we just return all for this agent's company, or filter by added_by.
    const customers = await db.customer.findMany({
      where: { 
        is_deleted: false,
        added_by: user.employee_id
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

export async function getCustomerWithDetails(id: string) {
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
  return updated;
}

export async function deleteCustomer(id: string) {
  try {
    await db.customer.update({
      where: { id },
      data: { is_deleted: true }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete customer:", error);
    return { success: false, error: error.message };
  }
}
