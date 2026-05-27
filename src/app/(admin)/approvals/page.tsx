"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { getApprovals } from "@/app/actions/approvals";

const filters = ["All", "Pending", "Approved", "Rejected"];

export default function ApprovalsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    getApprovals().then(data => {
      setApprovals(data);
      setLoading(false);
    });
  }, []);

  const pendingCount = approvals.filter(a => a.status === "pending").length;
  const filtered = activeFilter === "All" ? approvals : approvals.filter(a => a.status === activeFilter.toLowerCase());

  return (
    <div className="animate-fade-in">
      <PageHeader title="Approvals" description="Transaction edit and delete requests" actions={
        pendingCount > 0 && <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-semibold">{pendingCount} pending</span>
      } />
      <div className="flex gap-2 mb-6">
        {filters.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)} className={cn("px-4 py-2 text-sm font-medium rounded-lg transition-colors", activeFilter === f ? "bg-primary-500 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50")}>{f}</button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 mx-auto mb-3 animate-spin rounded-full border-4 border-primary-100 border-t-primary-500" />
            <p className="text-sm text-neutral-500">Loading approvals...</p>
          </div>
        ) : approvals.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-neutral-500">No approval requests found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-neutral-50 border-b">
              {["Request ID", "Requested By", "Type", "Txn ID", "Original Amount", "Request Date", "Status", "Action"].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
            {filtered.map(apr => (
              <tr key={apr.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-neutral-700">{apr.request_code}</td>
                <td className="py-3 px-4 font-medium text-neutral-900">{apr.requested_by_name}</td>
                <td className="py-3 px-4"><StatusBadge status={apr.request_type} /></td>
                <td className="py-3 px-4 font-mono text-xs text-primary-600">{apr.transaction_code}</td>
                <td className="py-3 px-4 font-semibold tabular-nums">{formatCurrency(apr.original_amount || 0)}</td>
                <td className="py-3 px-4 text-neutral-500 text-xs">{formatDate(apr.requested_at)}</td>
                <td className="py-3 px-4"><StatusBadge status={apr.status} /></td>
                <td className="py-3 px-4">
                  <Link href={`/approvals/${apr.id}`} className="text-xs text-primary-600 hover:underline font-medium">Review</Link>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
