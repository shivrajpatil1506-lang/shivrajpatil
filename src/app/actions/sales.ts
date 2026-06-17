"use server";

import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";

export async function createSale(formData: any) {
  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Create or Find Customer (For simplicity, we'll create a new one based on form data)
      const customer = await tx.customer.create({
        data: {
          first_name: formData.customer.firstName,
          middle_name: formData.customer.middleName || null,
          last_name: formData.customer.lastName,
          fathers_name: formData.customer.fathersName || null,
          dob: formData.customer.dob ? new Date(formData.customer.dob) : null,
          mobile_1: formData.customer.mobile1,
          mobile_2: formData.customer.mobile2 || null,
          email: formData.customer.email || null,
          aadhaar_encrypted: formData.customer.aadhaar || null,
          pan_number: formData.customer.pan || null,
          current_address: {
            line1: formData.customer.addressLine1,
            line2: formData.customer.addressLine2,
            city: formData.customer.city,
            state: formData.customer.state,
            pin: formData.customer.pin,
          },
          added_by: "agent-id", // placeholder
        }
      });

      // 2. Create SiteUnit
      const unit = await tx.siteUnit.create({
        data: {
          site_id: formData.property.siteId,
          unit_number: formData.property.unitNumber,
          floor_number: formData.property.floor ? parseInt(formData.property.floor) : null,
          tower_block: formData.property.towerBlock || null,
          property_type: formData.property.propertyType,
          carpet_area: formData.property.carpetArea ? parseFloat(formData.property.carpetArea) : null,
          builtup_area: formData.property.builtupArea ? parseFloat(formData.property.builtupArea) : null,
          total_price: formData.financial.totalAmount ? parseFloat(formData.financial.totalAmount) : null,
          status: "sold",
          customer_id: customer.id,
        }
      });

      // 3. Create CustomerPurchase
      const purchase = await tx.customerPurchase.create({
        data: {
          customer_id: customer.id,
          company_id: formData.property.companyId,
          site_id: formData.property.siteId,
          unit_id: unit.id,
          booking_date: formData.sale.bookingDate ? new Date(formData.sale.bookingDate) : new Date(),
          agreement_date: formData.sale.agreementDate ? new Date(formData.sale.agreementDate) : null,
          agent_id: "agent-id", // placeholder
          payment_plan: formData.financial.paymentPlan,
          total_agreement_value: parseFloat(formData.financial.totalAmount),
          booking_amount: formData.financial.bookingAmount ? parseFloat(formData.financial.bookingAmount) : null,
          num_instalments: formData.financial.numInstalments ? parseInt(formData.financial.numInstalments) : 1,
          instalment_frequency: formData.financial.instalmentFrequency || null,
          first_instalment_date: formData.financial.firstInstalmentDate ? new Date(formData.financial.firstInstalmentDate) : null,
          status: "active",
          notes: formData.sale.notes || null,
        }
      });

      // 4. Create Transaction for booking amount if > 0
      if (formData.financial.bookingAmount && parseFloat(formData.financial.bookingAmount) > 0) {
        await tx.transaction.create({
          data: {
            transaction_code: `TXN-${Date.now()}`,
            company_id: formData.property.companyId,
            site_id: formData.property.siteId,
            customer_id: customer.id,
            category: "PROPERTY_SALE",
            sub_category: "Booking Amount",
            transaction_date: purchase.booking_date,
            amount: parseFloat(formData.financial.bookingAmount),
            payment_mode: formData.financial.paymentMode || "bank_transfer",
            reference_no: formData.financial.referenceNo || null,
            added_by: "agent-id",
          }
        });
      }

      return purchase;
    });

    revalidateTag('customers', 'default');
    revalidateTag('sites', 'default');
    revalidateTag('transactions', 'default');
    return { success: true, purchase: result };
  } catch (error: any) {
    console.error("Failed to create sale:", error);
    return { success: false, error: error.message };
  }
}
