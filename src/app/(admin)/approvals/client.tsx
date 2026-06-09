"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";

const filters = ["All", "Pending", "Approved", "Rejected"];

export function ApprovalsClient({ initialApprovals }: { initialApprovals: any[] }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [approvals] = useState<any[]>(initialApprovals);

  const pendingCount = approvals.filter(a => a.status === "pending").length;
  const filtered = activeFilter === "All" ? approvals : approvals.filter(a => a.status === activeFilter.toLowerCase());

  return (
    <div className="animate-fade-in">
      <PageHeader title="Approvals" description="Transaction edit and delete requests" actions={
        pendingCount > 0 && <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-semibold">{pendingCount} pending</span>
      } />
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)} className={cn("px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap", activeFilter === f ? "bg-primary-500 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50")}>{f}</button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
        {approvals.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-neutral-500">No approval requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead><tr className="bg-neutral-50 border-b">
                {["Request ID", "Requested By", "Type", "Txn ID", "Original Amount", "Request Date", "Status", "Action"].map(h => <th key={h} className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
              {filtered.map(apr => (
                <tr key={apr.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-neutral-700 whitespace-nowrap">{apr.request_code}</td>
                  <td className="py-3 px-4 font-medium text-neutral-900 whitespace-nowrap">{apr.requested_by_name}</td>
                  <td className="py-3 px-4 whitespace-nowrap"><StatusBadge status={apr.request_type} /></td>
                  <td className="py-3 px-4 font-mono text-xs text-primary-600 whitespace-nowrap">{apr.transaction_code}</td>
                  <td className="py-3 px-4 font-semibold tabular-nums whitespace-nowrap">{formatCurrency(apr.original_amount || 0)}</td>
                  <td className="py-3 px-4 text-neutral-500 text-xs whitespace-nowrap">{formatDate(apr.requested_at)}</td>
                  <td className="py-3 px-4 whitespace-nowrap"><StatusBadge status={apr.status} /></td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Link href={`/approvals/${apr.id}`} className="text-xs text-primary-600 hover:underline font-medium">Review</Link>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
