"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { agentPerformance } from "@/lib/mock-data";
import { getAgentMetrics } from "@/app/actions/dashboard";
import { TrendingUp, Users, Target, Award, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PageHeader from "@/components/shared/PageHeader";

export default function AgentDashboard() {
  const [metrics, setMetrics] = React.useState({ monthlyTarget: 0, achieved: 0, activeLeads: 0, collections: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getAgentMetrics().then(data => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  const kpiData = [
    { label: "Sales Achieved", value: formatCurrency(metrics.achieved), trend: 5.2, icon: Target, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Monthly Target", value: formatCurrency(metrics.monthlyTarget), trend: null, icon: Award, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Active Leads", value: metrics.activeLeads, icon: Users, color: "text-indigo-600", bg: "bg-indigo-100" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Agent Dashboard" description="Your sales performance overview" />

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : (
        <>
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

      {/* Chart */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-heading)" }}>Top Performers</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentPerformance} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e5e5" />
              <XAxis type="number" tickFormatter={(val) => `₹${(val/10000000).toFixed(1)}Cr`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4a4a4a', fontWeight: 500 }} />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} cursor={{ fill: '#f5f5f5' }} />
              <Bar dataKey="value" name="Sales Value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
