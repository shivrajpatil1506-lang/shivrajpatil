import React from "react";
import ReportViewer from "@/components/features/ReportViewer";
import { getCashFlowReportData, getDefaulterReportData, getEmployeeDirectoryReportData } from "@/app/actions/reports";
import { notFound } from "next/navigation";

export default async function AdminReportViewerPage({ params }: { params: { type: string } }) {
  const type = params.type;

  let title = "Report Not Found";
  let description = "The requested report could not be generated.";
  let data: any[] = [];

  switch (type) {
    case "cash-flow":
      title = "Cash Flow Statement";
      description = "Comprehensive log of all financial inflows, outflows, and net cash positions across the company.";
      data = await getCashFlowReportData();
      break;
    case "defaulters":
      title = "Defaulter Report";
      description = "List of customers with overdue instalments or pending balances.";
      data = await getDefaulterReportData();
      break;
    case "employee-directory":
      title = "Employee Directory";
      description = "Consolidated roster of all active employees.";
      data = await getEmployeeDirectoryReportData();
      break;
    default:
      notFound();
  }

  return (
    <ReportViewer 
      title={title} 
      description={description} 
      data={data} 
      backLink="/reports" 
    />
  );
}
