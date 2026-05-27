"use client";

import React from "react";
import { useParams } from "next/navigation";
import ReportViewer from "@/components/features/ReportViewer";
import { generateCashFlowReport, generateDefaulterReport } from "@/lib/report-utils";

export default function AccountantReportViewerPage() {
  const params = useParams();
  const type = params.type as string;

  let title = "Report Not Found";
  let description = "The requested report could not be generated.";
  let data: any[] = [];

  switch (type) {
    case "cash-flow":
      title = "Cash Flow Statement";
      description = "Comprehensive log of all financial inflows, outflows, and net cash positions across the company.";
      data = generateCashFlowReport();
      break;
    case "defaulters":
      title = "Defaulter Report";
      description = "List of customers with overdue instalments or pending balances.";
      data = generateDefaulterReport();
      break;
  }

  return (
    <ReportViewer 
      title={title} 
      description={description} 
      data={data} 
      backLink="/accountant/reports" 
    />
  );
}
