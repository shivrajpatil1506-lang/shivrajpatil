"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { monthlyRevenueExpense, categoryBreakdown, instalmentStatus } from "@/lib/mock-data";
import { getAdminMetrics } from "@/app/actions/dashboard";
import { TrendingUp, TrendingDown, Building2, Users, Wallet, Receipt, LineChart, PieChart as PieChartIcon, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const [metrics, setMetrics] = React.useState({ revenue: 0, expenses: 0, activeProjects: 0, cashBalance: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getAdminMetrics().then(data => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  const kpiData = [
    { label: "Total Revenue", value: formatCurrency(metrics.revenue), trend: 12.5, icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Net Cash Balance", value: formatCurrency(metrics.cashBalance), trend: 8.2, icon: LineChart, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Expenses", value: formatCurrency(metrics.expenses), trend: -2.4, icon: Receipt, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Active Projects", value: metrics.activeProjects.toString(), trend: 0, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-100" },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Dashboard</h1>
          <p className="text-sm text-neutral-500">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 lg:col-span-2">
          <h3 className="text-base font-bold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-heading)" }}>Revenue vs Expenses (2024)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueExpense} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
                <YAxis tickFormatter={(val) => `₹${(val/10000000).toFixed(1)}Cr`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} cursor={{ fill: '#f5f5f5' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-heading)" }}>Revenue Breakdown</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryBreakdown.filter(c => c.value > 100000)} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {categoryBreakdown.filter(c => c.value > 100000).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryBreakdown.filter(c => c.value > 100000).slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="text-neutral-600">{item.name}</span>
                </div>
                <span className="font-semibold text-neutral-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
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
      </>
      )}
    </div>
  );
}
