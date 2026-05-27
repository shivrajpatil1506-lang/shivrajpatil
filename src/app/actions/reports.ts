"use server";

import { db } from "@/lib/db";
import { getRoleFilters } from "@/lib/rbac";

export async function getCashFlowReportData() {
  try {
    const { relatedFilter } = await getRoleFilters();
    
    const transactions = await db.transaction.findMany({
      where: { is_deleted: false, ...relatedFilter },
      orderBy: { transaction_date: 'desc' }
    });

    return transactions.map(t => ({
      "Date": t.transaction_date.toLocaleDateString(),
      "Transaction ID": t.transaction_code || t.id,
      "Payment Mode": (t.payment_mode || "N/A").toUpperCase(),
      "Category": t.category,
      "Description": t.description || "-",
      "Amount (INR)": t.amount,
      "Status": t.status.toUpperCase()
    }));
  } catch (error) {
    console.error("Failed to fetch cash flow data:", error);
    return [];
  }
}

export async function getDefaulterReportData() {
  try {
    const { relatedFilter } = await getRoleFilters();
    
    const purchases = await db.customerPurchase.findMany({
      where: { status: "active", ...relatedFilter },
      include: {
        customer: true,
        site: true,
        unit: true,
        instalments: true
      }
    });

    const defaulters = [];

    for (const p of purchases) {
      const totalReceived = p.instalments.reduce((sum, inst) => sum + (inst.amount_received || 0), 0);
      const pending = p.total_agreement_value - totalReceived;

      if (pending > 0) {
        defaulters.push({
          "Customer ID": p.customer.id,
          "Name": [p.customer.first_name, p.customer.last_name].filter(Boolean).join(" "),
          "Phone": p.customer.mobile_1,
          "Property Booked": `${p.site?.name || "Unknown"} - ${p.unit?.unit_number || "Unknown"}`,
          "Total Value": p.total_agreement_value,
          "Paid Amount": totalReceived,
          "Pending Amount": pending,
          "Status": "OVERDUE" // Can be refined to check individual due_dates if needed
        });
      }
    }

    return defaulters.sort((a, b) => b["Pending Amount"] - a["Pending Amount"]);
  } catch (error) {
    console.error("Failed to fetch defaulter data:", error);
    return [];
  }
}

export async function getEmployeeDirectoryReportData() {
  try {
    const { relatedFilter } = await getRoleFilters();
    
    const employees = await db.employee.findMany({
      where: { is_deleted: false, ...relatedFilter },
      orderBy: { first_name: 'asc' }
    });

    return employees.map(e => ({
      "Employee ID": e.employee_code || e.id,
      "Name": [e.first_name, e.last_name].filter(Boolean).join(" "),
      "Role": e.portal_role.toUpperCase(),
      "Department": e.department.replace('_', ' ').toUpperCase(),
      "Email": e.work_email || e.personal_email || "N/A",
      "Phone": e.personal_mobile,
      "Status": e.status.toUpperCase(),
      "Join Date": e.join_date.toLocaleDateString()
    }));
  } catch (error) {
    console.error("Failed to fetch employee directory data:", error);
    return [];
  }
}
