"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export default function DashboardCharts({
  monthlyRevenueExpense,
  categoryBreakdown
}: {
  monthlyRevenueExpense: { name: string, revenue: number, expenses: number }[],
  categoryBreakdown: { name: string, value: number }[]
}) {
  return (
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
  );
}
