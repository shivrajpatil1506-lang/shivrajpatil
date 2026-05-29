import React from "react";
import { formatCurrency } from "@/lib/utils";
import { instalmentStatus } from "@/lib/mock-data";
import { getAdminMetrics } from "@/app/actions/dashboard";
import { TrendingUp, TrendingDown, Building2, Users, Wallet, Receipt, LineChart } from "lucide-react";
import DashboardCharts from "./DashboardCharts";

export default async function AdminDashboard() {
  const metrics = await getAdminMetrics();

  const kpiData = [
    { label: "Total Revenue", value: formatCurrency(metrics.revenue), trend: 12.5, icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Net Cash Balance", value: formatCurrency(metrics.cashBalance), trend: 8.2, icon: LineChart, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Expenses", value: formatCurrency(metrics.expenses), trend: -2.4, icon: Receipt, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Active Projects", value: metrics.activeProjects.toString(), trend: 0, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-100" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Dashboard</h1>
          <p className="text-sm text-neutral-500">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-neutral-100 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${kpi.trend >= 0 ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"}`}>
                {kpi.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(kpi.trend)}%
              </div>
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
      
      {/* Instalment Status Table */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 overflow-hidden">
        <h3 className="text-base font-bold text-neutral-900 mb-4" style={{ fontFamily: "var(--font-heading)" }}>Project Collection Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-500 uppercase text-xs">
                <th className="py-3 px-4 font-semibold">Project Name</th>
                <th className="py-3 px-4 font-semibold text-right">Collected</th>
                <th className="py-3 px-4 font-semibold text-right">Pending</th>
                <th className="py-3 px-4 font-semibold text-right">Overdue</th>
                <th className="py-3 px-4 font-semibold text-center">Collection %</th>
              </tr>
            </thead>
            <tbody>
              {instalmentStatus.map((site, i) => {
                const total = site.collected + site.pending + site.overdue;
                const percent = Math.round((site.collected / total) * 100);
                return (
                  <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-neutral-900">{site.name}</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold text-right">{formatCurrency(site.collected)}</td>
                    <td className="py-3 px-4 text-amber-600 font-semibold text-right">{formatCurrency(site.pending)}</td>
                    <td className="py-3 px-4 text-red-600 font-semibold text-right">{formatCurrency(site.overdue)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-full max-w-[100px] h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-neutral-700 w-8 text-right">{percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
