"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, UserCheck, ShoppingBag, Users, TrendingUp } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getEmployeeWithDetails } from "@/app/actions/employees";

// Note: monthlySales is still mocked because real monthly aggregation 
// requires a complex query we haven't built yet.
const monthlySales = [
  { month: "Jan", deals: 1 }, { month: "Feb", deals: 2 }, { month: "Mar", deals: 1 },
  { month: "Apr", deals: 2 }, { month: "May", deals: 1 }, { month: "Jun", deals: 1 },
  { month: "Jul", deals: 2 }, { month: "Aug", deals: 1 }, { month: "Sep", deals: 1 },
  { month: "Oct", deals: 2 }, { month: "Nov", deals: 0 }, { month: "Dec", deals: 0 },
];

type AgentDetails = NonNullable<Awaited<ReturnType<typeof getEmployeeWithDetails>>>;

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployeeWithDetails(id).then(data => {
      setAgent(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="py-24 flex justify-center"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>;
  }

  if (!agent) {
    return <div className="py-24 text-center text-neutral-500">Agent not found.</div>;
  }

  // Use the nested `sales` for properties sold by this agent
  const agentSales = agent.sales || [];
  
  // To get customers, we extract unique customers from the sales
  const agentCustomersMap = new Map();
  agentSales.forEach(sale => {
    if (sale.customer) {
      if (!agentCustomersMap.has(sale.customer.id)) {
        agentCustomersMap.set(sale.customer.id, {
          ...sale.customer,
          property_type: sale.unit?.property_type || "N/A",
          unit_number: sale.unit?.unit_number || "N/A",
          site_name: sale.site?.name || "N/A",
          total_amount: sale.total_agreement_value || 0
        });
      } else {
        const existing = agentCustomersMap.get(sale.customer.id);
        agentCustomersMap.set(sale.customer.id, {
          ...existing,
          total_amount: existing.total_amount + (sale.total_agreement_value || 0)
        });
      }
    }
  });

  const agentCustomers = Array.from(agentCustomersMap.values());
  const totalValue = agentSales.reduce((sum, s) => sum + (s.total_agreement_value || 0), 0);

  return (
    <div className="animate-fade-in">
      <Link href="/agents" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Agents
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-sm">
          {getInitials([agent.first_name, agent.last_name].filter(Boolean).join(" ") || "Agent")}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>{[agent.first_name, agent.middle_name, agent.last_name].filter(Boolean).join(" ")}</h1>
          <p className="text-sm text-neutral-500">{agent.designation || "Agent"} · {(agent as any).company?.name || "Company"}</p>
        </div>
        <StatusBadge status={agent.access_status} size="md" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          ["Total Deals", agentSales.length || 0, "text-blue-700 bg-blue-50"],
          ["Total Value", formatCurrency(totalValue || 0), "text-emerald-700 bg-emerald-50"],
          ["Customers", agentCustomers.length || 0, "text-purple-700 bg-purple-50"],
          ["This Month", agentSales.filter(s => s.booking_date && new Date(s.booking_date).getMonth() === new Date().getMonth()).length, "text-amber-700 bg-amber-50"],
        ].map(([label, val, cls]) => (
          <div key={String(label)} className={cn("rounded-xl p-4 border border-neutral-100 shadow-sm", cls as string)}>
            <p className="text-xs text-neutral-500 mb-1">{String(label)}</p>
            <p className="text-xl font-bold">{String(val)}</p>
          </div>
        ))}
      </div>

      {/* Monthly performance chart */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 mb-6">
        <h3 className="text-sm font-semibold text-neutral-900 mb-4" style={{ fontFamily: "var(--font-heading)" }}>Monthly Sales Performance</h3>
        <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={0}>
          <BarChart data={monthlySales} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            <Bar dataKey="deals" name="Deals" fill="#14B8A6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Customers */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-neutral-900 mb-4" style={{ fontFamily: "var(--font-heading)" }}>Associated Customers</h3>
        {agentCustomers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No customers linked to this agent yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b">
              {["Name", "Mobile", "Property", "Site", "Amount"].map(h => <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-neutral-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {agentCustomers.map((c, i) => (
                <tr key={`${c.id}-${i}`} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                  <td className="py-2 px-3 font-medium text-neutral-900">{[c.first_name, c.middle_name, c.last_name].filter(Boolean).join(" ")}</td>
                  <td className="py-2 px-3 text-neutral-600 tabular-nums">{c.mobile_1}</td>
                  <td className="py-2 px-3 text-xs">{c.property_type} — {c.unit_number}</td>
                  <td className="py-2 px-3 text-xs text-neutral-600">{c.site_name}</td>
                  <td className="py-2 px-3 font-semibold text-emerald-700 tabular-nums">{formatCurrency(c.total_amount || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
