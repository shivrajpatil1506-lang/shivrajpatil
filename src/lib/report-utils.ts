import { mockTransactions, mockEmployees, mockCustomers } from "./mock-data";

/**
 * Converts an array of objects into a CSV string and triggers a browser download.
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      // Escape commas and quotes for CSV safely
      const stringVal = String(val ?? "").replace(/"/g, '""');
      return `"${stringVal}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 1. Cash Flow Statement
 * Aggregates all incomes vs expenses from transactions.
 */
export function generateCashFlowReport() {
  return mockTransactions.map(t => ({
    "Date": new Date(t.transaction_date).toLocaleDateString(),
    "Transaction ID": t.id,
    "Payment Mode": t.payment_mode.toUpperCase(),
    "Category": t.category,
    "Description": t.description,
    "Amount (INR)": t.amount,
    "Status": t.status.toUpperCase(),
  })).sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
}

/**
 * 2. Defaulter Report
 * Identifies customers with pending instalments past their due date.
 * (For mock purposes, we will find customers with pending_amount > 0 and assume they are overdue)
 */
export function generateDefaulterReport() {
  return mockCustomers
    .filter(c => (c.pending_amount || 0) > 0)
    .map(c => ({
      "Customer ID": c.id,
      "Name": c.full_name || `${c.first_name} ${c.last_name}`,
      "Phone": c.mobile_1,
      "Property Booked": `${c.site_name || "Unknown"} - ${c.unit_number || "Unknown"}`,
      "Total Value": c.total_amount || 0,
      "Paid Amount": c.received_amount || 0,
      "Pending Amount": c.pending_amount || 0,
      "Status": c.payment_status ? c.payment_status.toUpperCase() : "UNKNOWN",
    }))
    .sort((a, b) => b["Pending Amount"] - a["Pending Amount"]);
}

/**
 * 3. Employee Directory
 * Consolidated list of active employees for HR and Payroll.
 */
export function generateEmployeeDirectory() {
  return mockEmployees.map(e => ({
    "Employee ID": e.employee_code || e.id,
    "Name": e.full_name || `${e.first_name} ${e.last_name}`,
    "Role": e.portal_role ? e.portal_role.toUpperCase() : "UNKNOWN",
    "Department": e.department ? e.department.replace('_', ' ').toUpperCase() : "UNKNOWN",
    "Email": e.work_email || e.personal_email || "N/A",
    "Phone": e.personal_mobile,
    "Status": e.access_status ? e.access_status.toUpperCase() : "UNKNOWN",
    "Join Date": new Date(e.join_date).toLocaleDateString(),
  }));
}
