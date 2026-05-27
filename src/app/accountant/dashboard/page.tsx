"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { cashFlowData } from "@/lib/mock-data";
import { getAccountantMetrics } from "@/app/actions/dashboard";
import { TrendingUp, TrendingDown, FileText, Wallet, AlertCircle, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PageHeader from "@/components/shared/PageHeader";

export default function AccountantDashboard() {
  const [metrics, setMetrics] = React.useState({ todaysCollection: 0, pendingPayments: 0, bankBalance: 0, pendingApprovals: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getAccountantMetrics().then(data => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  const kpiData = [
    { label: "Bank Balance", value: formatCurrency(metrics.bankBalance), trend: 5.2, icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Pending Approvals", value: metrics.pendingApprovals, icon: FileText, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Today's Collections", value: formatCurrency(metrics.todaysCollection), icon: Wallet, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Pending Payments", value: formatCurrency(metrics.pendingPayments), icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Accountant Dashboard" description="Financial overview and pending tasks" />

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : (
        <>
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

      {/* Chart */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-heading)" }}>Cash Flow Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cashFlowData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
              <YAxis tickFormatter={(val) => `₹${(val/100000).toFixed(0)}L`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="net" name="Net Flow" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
