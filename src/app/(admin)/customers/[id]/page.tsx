"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, CreditCard, Calendar, MapPin, Building } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { cn, formatCurrency, formatDate, maskAadhaar, maskPan } from "@/lib/utils";
import { getCustomerWithDetails } from "@/app/actions/customers";

const tabs = ["Profile", "Purchases", "Payment History"];

type CustomerDetails = NonNullable<Awaited<ReturnType<typeof getCustomerWithDetails>>>;

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("Profile");
  const [cust, setCust] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomerWithDetails(id).then(data => {
      setCust(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="py-24 flex justify-center"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>;
  }

  if (!cust) {
    return <div className="py-24 text-center text-neutral-500">Customer not found.</div>;
  }

  const purchases = cust.purchases || [];
  const transactions = cust.transactions || [];
  
  const totalAmount = purchases.reduce((sum, p) => sum + (p.total_agreement_value || 0), 0);
  const receivedAmount = transactions.filter(t => t.status === "completed").reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = Math.max(0, totalAmount - receivedAmount);
  
  const fullName = [cust.first_name, cust.middle_name, cust.last_name].filter(Boolean).join(" ");
  const latestPurchase = purchases[0];

  return (
    <div className="animate-fade-in">
      <Link href="/customers" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-4"><ArrowLeft className="w-4 h-4" /> Back to Customers</Link>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold">{cust.first_name?.[0]}{cust.last_name?.[0]}</div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>{fullName}</h1>
          {latestPurchase ? (
            <p className="text-sm text-neutral-500">{latestPurchase.unit?.property_type || "Unit"} — {latestPurchase.unit?.unit_number || "—"} at {latestPurchase.site?.name || "—"}</p>
          ) : (
            <p className="text-sm text-neutral-500">No active purchases</p>
          )}
        </div>
        <StatusBadge status={latestPurchase?.status || "active"} size="md" />
        <Link href={`/customers/${cust.id}/edit`} className="ml-auto px-4 py-2 bg-white border border-neutral-200 text-sm font-medium text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm">
          Edit Customer
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[["Total Amount", totalAmount, "text-neutral-900 bg-white"], ["Received", receivedAmount, "text-emerald-700 bg-emerald-50"], ["Pending", pendingAmount, "text-red-700 bg-red-50"]].map(([label, val, cls]) => (
          <div key={String(label)} className={cn("rounded-xl p-4 border border-neutral-100 shadow-sm", cls as string)}>
            <p className="text-xs text-neutral-500 uppercase mb-1">{String(label)}</p>
            <p className="text-xl font-bold tabular-nums">{formatCurrency(val as number)}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-neutral-200 mb-6">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2.5 text-sm font-medium transition-colors relative", activeTab === tab ? "text-primary-600" : "text-neutral-500 hover:text-neutral-700")}>
            {tab}{activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />}
          </button>
        ))}
      </div>

      {activeTab === "Profile" && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900 text-sm">Personal Information</h3>
            {[
              [<User key="u" className="w-4 h-4" />, "Full Name", fullName],
              [<Phone key="p1" className="w-4 h-4" />, "Mobile 1", cust.mobile_1],
              [<Phone key="p2" className="w-4 h-4" />, "Mobile 2", cust.mobile_2 || "—"],
              [<Mail key="m" className="w-4 h-4" />, "Email", cust.email || "—"],
              [<CreditCard key="a" className="w-4 h-4" />, "Aadhaar", cust.aadhaar_encrypted ? "XXXX-XXXX-" + cust.aadhaar_encrypted.slice(-4) : "—"],
              [<CreditCard key="pa" className="w-4 h-4" />, "PAN", cust.pan_number ? maskPan(cust.pan_number) : "—"],
              [<Calendar key="d" className="w-4 h-4" />, "Type", cust.customer_type],
            ].map(([icon, label, val]) => (
              <div key={String(label)} className="flex items-center gap-3 text-sm border-b border-neutral-50 pb-2">
                <span className="text-neutral-400">{icon}</span>
                <span className="text-neutral-500 w-24 shrink-0">{String(label)}</span>
                <span className="font-medium text-neutral-900">{String(val)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900 text-sm">Other Details</h3>
            {[
              ["Company Name", cust.company_name || "—"],
              ["Father's Name", cust.fathers_name || "—"],
              ["DOB", cust.dob ? formatDate(cust.dob) : "—"],
              ["Gender", cust.gender ? cust.gender.charAt(0).toUpperCase() + cust.gender.slice(1) : "—"],
              ["Added By", cust.added_by || "—"],
            ].map(([label, val]) => (
              <div key={String(label)} className="flex items-center gap-3 text-sm border-b border-neutral-50 pb-2">
                <span className="text-neutral-500 w-24 shrink-0">{String(label)}</span>
                <span className="font-medium text-neutral-900">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Purchases" && (
        <div className="space-y-4">
          {purchases.length === 0 ? (
             <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-8 text-center text-sm text-neutral-500">No purchases found.</div>
          ) : purchases.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-neutral-900">{p.unit?.unit_number || "—"}</h3>
                  <p className="text-sm text-neutral-500">{p.site?.name || "—"} · {p.company?.name || "—"}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  ["Booking Date", formatDate(p.booking_date)],
                  ["Agreement Value", formatCurrency(p.total_agreement_value)],
                  ["Payment Plan", p.payment_plan.replace("_", " ").toUpperCase()],
                  ["Num Instalments", p.num_instalments],
                ].map(([label, val]) => (
                  <div key={String(label)}>
                    <p className="text-xs text-neutral-500 mb-1">{label}</p>
                    <p className="font-semibold text-sm">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Payment History" && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          {transactions.length === 0 ? (
            <p className="p-8 text-center text-sm text-neutral-500">No transactions found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-neutral-50 border-b">
                {["Txn ID", "Date", "Amount", "Mode", "Status"].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="py-3 px-4 font-mono text-xs text-neutral-600">{txn.transaction_code}</td>
                    <td className="py-3 px-4 tabular-nums text-xs text-neutral-600">{formatDate(txn.transaction_date)}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-700 tabular-nums">{formatCurrency(txn.amount)}</td>
                    <td className="py-3 px-4 text-neutral-600 text-xs">{txn.payment_mode}</td>
                    <td className="py-3 px-4"><StatusBadge status={txn.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
