"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { monthlySalaryCost } from "@/lib/mock-data";
import { getHRMetrics } from "@/app/actions/dashboard";
import { Users, UserPlus, CheckCircle, ClipboardList, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PageHeader from "@/components/shared/PageHeader";

export default function HRDashboard() {
  const [metrics, setMetrics] = React.useState({ totalEmployees: 0, activeAgents: 0, monthlySalary: 0, pendingLeaves: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getHRMetrics().then(data => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  const kpiData = [
    { label: "Total Employees", value: metrics.totalEmployees, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Active Agents", value: metrics.activeAgents, icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Monthly Salary Run Rate", value: formatCurrency(metrics.monthlySalary), icon: ClipboardList, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "Pending Leaves", value: metrics.pendingLeaves, icon: CheckCircle, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="HR Dashboard" description="Employee and payroll overview" />

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : (
        <>
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

      {/* Chart */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-heading)" }}>Monthly Salary Outflow Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlySalaryCost} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
              <YAxis tickFormatter={(val) => `₹${(val/100000).toFixed(1)}L`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Area type="monotone" dataKey="cost" name="Salary Cost" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
