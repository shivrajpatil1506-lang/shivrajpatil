import React from "react";
import { formatCurrency } from "@/lib/utils";
import { getAccountantMetrics } from "@/app/actions/dashboard";
import { TrendingUp, TrendingDown, FileText, Wallet, AlertCircle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DashboardCharts from "./DashboardCharts";

export default async function AccountantDashboard() {
  const metrics = await getAccountantMetrics();

  const kpiData = [
    { label: "Bank Balance", value: formatCurrency(metrics.bankBalance), trend: 5.2, icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Pending Approvals", value: metrics.pendingApprovals, icon: FileText, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Today's Collections", value: formatCurrency(metrics.todaysCollection), icon: Wallet, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Pending Payments", value: formatCurrency(metrics.pendingPayments), icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Accountant Dashboard" description="Financial overview and pending tasks" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-neutral-100 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              {kpi.trend !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${kpi.trend >= 0 ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"}`}>
                  {kpi.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(kpi.trend)}%
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-neutral-900">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Client Component for Heavy Charts */}
      <DashboardCharts />
    </div>
  );
}
