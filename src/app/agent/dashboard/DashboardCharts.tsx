"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { agentPerformance } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardCharts() {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-heading)" }}>Top Performers</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height={300}>
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
  );
}
