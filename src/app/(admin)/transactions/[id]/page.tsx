"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getTransactionById } from "@/app/actions/transactions";
import { CATEGORY_LABELS, INCOME_CATEGORIES } from "@/lib/constants";

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [txn, setTxn] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactionById(id).then(data => {
      setTxn(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="py-24 flex justify-center"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!txn) return <div className="py-24 text-center text-neutral-500">Transaction not found.</div>;

  const isIncome = INCOME_CATEGORIES.includes(txn.category as typeof INCOME_CATEGORIES[number]);

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <Link href="/transactions" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Transactions
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold", isIncome ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
          {isIncome ? "+" : "−"}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-neutral-900 font-mono" style={{ fontFamily: "var(--font-heading)" }}>{txn.transaction_code}</h1>
          <p className="text-sm text-neutral-500">{CATEGORY_LABELS[txn.category] || txn.category} · {formatDate(txn.transaction_date)}</p>
        </div>
        <div className={cn("text-2xl font-bold tabular-nums", isIncome ? "text-emerald-600" : "text-red-600")}>
          {isIncome ? "+" : "−"}{formatCurrency(txn.amount)}
        </div>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center justify-between mb-5">
        <StatusBadge status={txn.status} size="md" />
        <div className="flex gap-2">
          <Link href={`/transactions/${txn.id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-neutral-200 text-neutral-700 bg-white rounded-lg hover:bg-neutral-50 transition-colors shadow-sm">
            <Edit className="w-4 h-4" /> Edit Transaction
          </Link>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 mb-5">
        <h3 className="font-semibold text-neutral-900 text-sm mb-4">Transaction Details</h3>
        <div className="space-y-0">
          {[
            ["Transaction ID", txn.transaction_code],
            ["Date", formatDate(txn.transaction_date)],
            ["Company", txn.company_name],
            ["Site", txn.site_name || "—"],
            ["Category", CATEGORY_LABELS[txn.category] || txn.category],
            ["Amount", formatCurrency(txn.amount)],
            ["Payment Mode", txn.payment_mode],
            ["Reference No.", txn.reference_no || "—"],
            ["Customer", txn.customer_name || "—"],
            ["Employee", txn.employee_name || "—"],
            ["Vendor", txn.vendor_name || "—"],
            ["Invoice No.", txn.invoice_number || "—"],
            ["Added By", txn.added_by_name],
            ["Added At", formatDate(txn.added_at)],
          ].map(([label, val]) => val !== "—" && (
            <div key={String(label)} className="flex justify-between text-sm py-2.5 border-b border-neutral-50">
              <span className="text-neutral-500">{String(label)}</span>
              <span className={cn("font-medium text-neutral-900", label === "Amount" && (isIncome ? "text-emerald-600" : "text-red-600"))}>{String(val)}</span>
            </div>
          ))}
        </div>
        {txn.description && (
          <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-500 mb-1">Description</p>
            <p className="text-sm text-neutral-800">{txn.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
