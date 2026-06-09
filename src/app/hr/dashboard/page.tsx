import React from "react";
import { formatCurrency } from "@/lib/utils";
import { getHRMetrics } from "@/app/actions/dashboard";
import { Users, UserPlus, CheckCircle, ClipboardList } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DashboardCharts from "./DashboardCharts";

export default async function HRDashboard() {
  const metrics = await getHRMetrics();

  const kpiData = [
    { label: "Total Employees", value: metrics.totalEmployees, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Active Agents", value: metrics.activeAgents, icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Monthly Salary Run Rate", value: formatCurrency(metrics.monthlySalary), icon: ClipboardList, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "Pending Leaves", value: metrics.pendingLeaves, icon: CheckCircle, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="HR Dashboard" description="Employee and payroll overview" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-neutral-100 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
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
    </div>
  );
}
