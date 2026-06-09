import React from "react";
import { formatCurrency } from "@/lib/utils";
import { getAgentMetrics } from "@/app/actions/dashboard";
import { TrendingUp, Users, Target, Award } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DashboardCharts from "./DashboardCharts";

export default async function AgentDashboard() {
  const metrics = await getAgentMetrics();

  const kpiData = [
    { label: "Sales Achieved", value: formatCurrency(metrics.achieved), trend: 5.2, icon: Target, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Monthly Target", value: formatCurrency(metrics.monthlyTarget), trend: null, icon: Award, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Active Leads", value: metrics.activeLeads, icon: Users, color: "text-indigo-600", bg: "bg-indigo-100" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Agent Dashboard" description="Your sales performance overview" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiData.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-neutral-100 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              {kpi.trend && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full text-emerald-700 bg-emerald-50`}>
                  <TrendingUp className="w-3 h-3" />
                  {kpi.trend}%
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
