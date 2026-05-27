"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Clock, Edit3, Trash2, Loader2 } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getApprovalById, updateApprovalStatus } from "@/app/actions/approvals";
import { db } from "@/lib/db";
import { CATEGORY_LABELS } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";

export default function ApprovalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error } = useToast();
  const [reviewNotes, setReviewNotes] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const [approval, setApproval] = useState<any>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  React.useEffect(() => {
    getApprovalById(id).then(async data => {
      setApproval(data);
      if (data) {
        // Just mock transaction for now or fetch it through a server action if needed
        // The transaction code is already on the approval record mostly
      }
      setFetching(false);
    });
  }, [id]);

  const isPending = approval?.status === "pending";

  const handleDecision = async (action: "approve" | "reject") => {
    if (!reviewNotes.trim()) { error("Notes required", "Please add review notes before making a decision."); return; }
    setLoading(action);
    const result = await updateApprovalStatus(id, action === "approve" ? "approved" : "rejected", reviewNotes);
    if (result.success) {
      if (action === "approve") {
        success("Request Approved", `${approval.request_code} has been approved.`);
      } else {
        error("Request Rejected", `${approval.request_code} has been rejected.`);
      }
      router.push("/approvals");
    } else {
      error("Error", result.error || "Failed to update approval");
      setLoading(null);
    }
  };

  if (fetching) return <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  if (!approval) return <div className="p-16 text-center text-neutral-500">Approval not found</div>;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <Link href="/approvals" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Approvals
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", approval.request_type === "edit" ? "bg-amber-50" : "bg-red-50")}>
          {approval.request_type === "edit" ? <Edit3 className="w-6 h-6 text-amber-600" /> : <Trash2 className="w-6 h-6 text-red-600" />}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>{approval.request_code}</h1>
          <p className="text-sm text-neutral-500">Request to {approval.request_type === "edit" ? "edit" : "delete"} transaction {approval.transaction_code}</p>
        </div>
        <StatusBadge status={approval.status} size="md" />
      </div>

      {/* Request Meta */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 mb-5">
        <h3 className="font-semibold text-neutral-900 text-sm mb-4">Request Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ["Requested By", approval.requested_by_name],
            ["Request Date", formatDate(approval.requested_at)],
            ["Transaction ID", approval.transaction_code],
            ["Original Amount", formatCurrency((approval.original_data as any)?.amount || 0)],
            ["Category", (approval.original_data as any)?.category || "—"],
            ["Transaction Date", approval.transaction_date ? formatDate(approval.transaction_date) : "—"],
          ].map(([label, val]) => (
            <div key={String(label)} className="py-2 border-b border-neutral-50">
              <p className="text-xs text-neutral-500 mb-0.5">{String(label)}</p>
              <p className="font-medium text-neutral-900">{String(val)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
          <p className="text-xs text-neutral-500 mb-1">Reason for Request</p>
          <p className="text-sm text-neutral-800 leading-relaxed">{approval.reason}</p>
        </div>
      </div>

      {/* Changes Comparison */}
      {approval.request_type === "edit" && approval.requested_changes && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 mb-5">
          <h3 className="font-semibold text-neutral-900 text-sm mb-4">Requested Changes</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase mb-3">Original</p>
              <div className="space-y-2">
                {Object.entries(approval.original_data || {}).map(([key, val]) => (
                  <div key={key} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-[10px] text-red-500 uppercase mb-0.5">{key.replace("_", " ")}</p>
                    <p className="text-sm font-medium text-red-800">{typeof val === "number" ? formatCurrency(val as number) : String(val)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase mb-3">Requested</p>
              <div className="space-y-2">
                {Object.entries(approval.requested_changes || {}).map(([key, val]) => (
                  <div key={key} className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-[10px] text-emerald-500 uppercase mb-0.5">{key.replace("_", " ")}</p>
                    <p className="text-sm font-medium text-emerald-800">{typeof val === "number" ? formatCurrency(val as number) : String(val)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {approval.request_type === "delete" && (
        <div className="bg-red-50 rounded-xl border border-red-100 p-6 mb-5">
          <div className="flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 mb-1">Delete Request</p>
              <p className="text-sm text-red-700">This will permanently delete transaction <strong>{approval.transaction_id}</strong> of amount <strong>{formatCurrency((approval.original_data as any)?.amount || 0)}</strong>. This action cannot be undone.</p>
            </div>
          </div>
        </div>
      )}

      {/* Review section */}
      {approval.status !== "pending" && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 mb-5">
          <h3 className="font-semibold text-neutral-900 text-sm mb-3">Review Details</h3>
          <div className="flex items-center gap-3">
            {approval.status === "approved" ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
            <div>
              <p className="text-sm font-medium text-neutral-900">{approval.status === "approved" ? "Approved" : "Rejected"} by {approval.reviewed_by}</p>
              {approval.reviewed_at && <p className="text-xs text-neutral-500">{formatDate(approval.reviewed_at)}</p>}
            </div>
          </div>
          {approval.review_notes && <p className="mt-3 text-sm text-neutral-700 p-3 bg-neutral-50 rounded-lg">{approval.review_notes}</p>}
        </div>
      )}

      {/* Action Buttons */}
      {isPending && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
          <h3 className="font-semibold text-neutral-900 text-sm mb-3">Admin Decision</h3>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wide">Review Notes *</label>
            <textarea
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none mb-4"
              rows={3}
              placeholder="Add notes about your decision..."
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleDecision("approve")}
              disabled={loading !== null}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading === "approve" ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {loading === "approve" ? "Approving..." : "Approve"}
            </button>
            <button
              onClick={() => handleDecision("reject")}
              disabled={loading !== null}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading === "reject" ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
              {loading === "reject" ? "Rejecting..." : "Reject"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
