"use client";

import React from "react";
import Link from "next/link";
import { BarChart3, FileText, CreditCard, MapPin, Building2, AlertTriangle, TrendingUp } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

const reports = [
  { name: "Cash Flow Statement", desc: "Inflows, outflows, and net cash position", icon: TrendingUp, color: "#22C55E", slug: "cash-flow" },
  { name: "Instalment Collection", desc: "Due vs collected per customer with aging", icon: CreditCard, color: "#F59E0B", slug: null },
  { name: "Defaulter Report", desc: "Overdue instalments sorted by days and amount", icon: AlertTriangle, color: "#EF4444", slug: "defaulters" },
  { name: "Site-wise Transactions", desc: "Income and expenses per construction site", icon: MapPin, color: "#8B5CF6", slug: null },
  { name: "Company Consolidated", desc: "Side-by-side comparison of all subsidiaries", icon: Building2, color: "#06B6D4", slug: null },
  { name: "Profit & Loss Statement", desc: "Revenue, expenses, and net profit analysis", icon: BarChart3, color: "#2563EB", slug: null },
];

export default function AccountantReports() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Reports" description="Financial and operational reports" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reports.map(report => {
          const content = (
            <div className={`bg-white rounded-xl border border-neutral-100 shadow-sm p-5 transition-all group h-full ${report.slug ? 'hover:shadow-md hover:border-primary-200 cursor-pointer' : 'opacity-75 cursor-not-allowed'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${report.color}15` }}>
                    <report.icon className="w-5 h-5" style={{ color: report.color }} />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm transition-colors ${report.slug ? 'text-neutral-900 group-hover:text-primary-600' : 'text-neutral-500'}`}>{report.name}</h4>
                    <p className="text-xs text-neutral-500 mt-1">{report.desc}</p>
                  </div>
                </div>
                {!report.slug && (
                  <span className="text-[9px] font-medium px-2 py-0.5 bg-neutral-100 text-neutral-400 rounded-full whitespace-nowrap">Coming Soon</span>
                )}
              </div>
              
              {report.slug && (
                <div className="mt-4 flex gap-2">
                  <span className="px-3 py-1.5 text-xs font-medium bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-500 group-hover:text-white transition-colors">Generate Report</span>
                </div>
              )}
            </div>
          );

          return report.slug ? (
            <Link key={report.name} href={`/accountant/reports/${report.slug}`} className="block">
              {content}
            </Link>
          ) : (
            <div key={report.name}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
