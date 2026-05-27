"use client";

import React from "react";
import Link from "next/link";
import { BarChart3, FileText, Users, UserCheck, DollarSign, Building2, MapPin, AlertTriangle, CreditCard, Briefcase, TrendingUp } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

const reports = [
  { group: "Financial Reports", items: [
    { name: "Profit & Loss Statement", desc: "Revenue, expenses, and net profit analysis", icon: BarChart3, color: "#2563EB", slug: null },
    { name: "Cash Flow Statement", desc: "Inflows, outflows, and net cash position", icon: TrendingUp, color: "#22C55E", slug: "cash-flow" },
    { name: "Instalment Collection", desc: "Due vs collected per customer with aging", icon: CreditCard, color: "#F59E0B", slug: null },
    { name: "Site-wise Transactions", desc: "Income and expenses per construction site", icon: MapPin, color: "#8B5CF6", slug: null },
    { name: "Company Consolidated", desc: "Side-by-side comparison of all subsidiaries", icon: Building2, color: "#06B6D4", slug: null },
  ]},
  { group: "Customer Reports", items: [
    { name: "Customer Payment Summary", desc: "Total payable, received, balance per customer", icon: Users, color: "#EC4899", slug: null },
    { name: "Defaulter Report", desc: "Overdue instalments sorted by days and amount", icon: AlertTriangle, color: "#EF4444", slug: "defaulters" },
  ]},
  { group: "HR & Sales Reports", items: [
    { name: "Salary Statement", desc: "Monthly salary breakdown for all employees", icon: DollarSign, color: "#F97316", slug: null },
    { name: "Employee Directory", desc: "Complete employee listing with details", icon: Briefcase, color: "#6366F1", slug: "employee-directory" },
    { name: "Sales Performance", desc: "Agent-wise deals closed and value generated", icon: UserCheck, color: "#14B8A6", slug: null },
    { name: "Property Sales Report", desc: "Units sold vs available by site and type", icon: FileText, color: "#D946EF", slug: null },
  ]},
];

export default function ReportsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Reports" description="Comprehensive financial and operational reports" />
      {reports.map(group => (
        <div key={group.group} className="mb-8">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">{group.group}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {group.items.map(report => {
              const content = (
                <div className={`bg-white rounded-xl border border-neutral-100 shadow-sm p-5 transition-all group h-full ${report.slug ? 'hover:shadow-md hover:border-primary-200 cursor-pointer' : 'opacity-75 cursor-not-allowed'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${report.color}15` }}>
                        <report.icon className="w-5 h-5" style={{ color: report.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
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
                <Link key={report.name} href={`/reports/${report.slug}`} className="block">
                  {content}
                </Link>
              ) : (
                <div key={report.name}>{content}</div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
