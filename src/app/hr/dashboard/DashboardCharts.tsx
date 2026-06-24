"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { monthlySalaryCost } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardCharts() {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-heading)" }}>Monthly Salary Outflow Trend</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height={300}>
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
  );
}
