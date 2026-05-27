"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import { getCompanies } from "@/app/actions/companies";
import { getSites } from "@/app/actions/sites";
import { PAYMENT_MODES, INCOME_CATEGORIES } from "@/lib/constants";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { getCustomers } from "@/app/actions/customers";
import { createTransaction } from "@/app/actions/transactions";

const ALL_CATEGORIES = [
  { value: "INSTALMENT_RECEIVED", label: "Instalment Received", type: "income" },
  { value: "BOOKING_AMOUNT", label: "Booking Amount", type: "income" },
  { value: "PROPERTY_SALE", label: "Property Sale", type: "income" },
  { value: "OTHER_INCOME", label: "Other Income", type: "income" },
  { value: "SALARY", label: "Salary", type: "expense" },
  { value: "PURCHASE", label: "Purchase", type: "expense" },
  { value: "PETTY_EXPENSE", label: "Petty Expense", type: "expense" },
  { value: "CONTRACTOR_PAYMENT", label: "Contractor Payment", type: "expense" },
  { value: "UTILITY_EXPENSE", label: "Utility Expense", type: "expense" },
  { value: "OTHER_EXPENSE", label: "Other Expense", type: "expense" },
  { value: "INTER_COMPANY_TRANSFER", label: "Inter-Company Transfer", type: "transfer" },
];

export default function AddTransactionPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [companyId, setCompanyId] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);

  // Other fields
  const [siteId, setSiteId] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0]);
  const [referenceNo, setReferenceNo] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [instalmentNo, setInstalmentNo] = useState("");

  useEffect(() => {
    getCustomers().then(data => setCustomers(data));
    getCompanies().then(setCompanies);
    getSites().then(setSites);
  }, []);

  const filteredSites = companyId ? sites.filter(s => s.company_id === companyId) : sites;
  const isIncome = INCOME_CATEGORIES.includes(category as typeof INCOME_CATEGORIES[number]);
  const isExpense = ["SALARY", "PURCHASE", "PETTY_EXPENSE", "CONTRACTOR_PAYMENT", "UTILITY_EXPENSE", "OTHER_EXPENSE"].includes(category);
  const isCustomerCategory = ["INSTALMENT_RECEIVED", "BOOKING_AMOUNT", "PROPERTY_SALE"].includes(category);

  const handleSubmit = async () => {
    if (!companyId)           { error("Missing field", "Please select a company."); return; }
    if (!category)            { error("Missing field", "Please select a category."); return; }
    if (!amount || Number(amount) <= 0) { error("Invalid amount", "Please enter a valid amount."); return; }
    if (!paymentMode)         { error("Missing field", "Please select a payment mode."); return; }
    if (!description.trim())  { error("Missing field", "Description is required."); return; }

    setLoading(true);
    
    const formData = {
      companyId,
      siteId,
      category,
      amount,
      paymentMode,
      description,
      transactionDate,
      referenceNo,
      customerId,
      instalmentNo,
    };

    const res = await createTransaction(formData);
    setLoading(false);
    
    if (res.success) {
      success("Transaction Recorded", `₹${Number(amount).toLocaleString("en-IN")} recorded successfully.`);
      router.push("/transactions");
    } else {
      error("Failed to record transaction", res.error);
    }
  };

  const inputClass = "w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors";
  const labelClass = "block text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wide";

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <Link href="/transactions" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Transactions
      </Link>
      <PageHeader title="Add Transaction" description="Record a new financial transaction" />

      <div className="space-y-6">
        {/* Core Details */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">1</span>
            Transaction Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Company *</label>
              <select className={inputClass} value={companyId} onChange={e => setCompanyId(e.target.value)}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.short_name || c.name}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Site</label>
              <select className={inputClass} value={siteId} onChange={e => setSiteId(e.target.value)}>
                <option value="">Select Site (optional)</option>
                {filteredSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Category *</label>
              <select className={inputClass} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Select Category</option>
                <optgroup label="Income">
                  {ALL_CATEGORIES.filter(c => c.type === "income").map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </optgroup>
                <optgroup label="Expense">
                  {ALL_CATEGORIES.filter(c => c.type === "expense").map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </optgroup>
                <optgroup label="Transfer">
                  {ALL_CATEGORIES.filter(c => c.type === "transfer").map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </optgroup>
              </select>
            </div>
            <div><label className={labelClass}>Transaction Date *</label><input type="date" className={inputClass} value={transactionDate} onChange={e => setTransactionDate(e.target.value)} /></div>
            <div><label className={labelClass}>Amount (₹) *</label>
              <input type="number" className={inputClass} placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div><label className={labelClass}>Payment Mode *</label>
              <select className={inputClass} value={paymentMode} onChange={e => setPaymentMode(e.target.value)}><option value="">Select Mode</option>{PAYMENT_MODES.map(pm => <option key={pm}>{pm}</option>)}</select>
            </div>
            <div><label className={labelClass}>Reference / Cheque No.</label><input className={inputClass} placeholder="Bank reference, cheque number..." value={referenceNo} onChange={e => setReferenceNo(e.target.value)} /></div>
          </div>
        </div>

        {/* Customer (for income categories) */}
        {isCustomerCategory && (
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">2</span>
              Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Customer *</label>
                <select className={inputClass} value={customerId} onChange={e => setCustomerId(e.target.value)}>
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} {c.purchases?.[0] ? `— ${c.purchases[0].unit?.unit_number || "Unit"}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {category === "INSTALMENT_RECEIVED" && (
                <div><label className={labelClass}>Instalment Number</label><input type="number" className={inputClass} placeholder="e.g. 3" min="1" value={instalmentNo} onChange={e => setInstalmentNo(e.target.value)} /></div>
              )}
            </div>
          </div>
        )}

        {/* Vendor/Expense details */}
        {isExpense && category !== "SALARY" && (
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">2</span>
              Vendor / Expense Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Vendor Name</label><input className={inputClass} placeholder="Vendor or supplier name" /></div>
              <div><label className={labelClass}>Invoice Number</label><input className={inputClass} placeholder="INV-XXXX" /></div>
              <div><label className={labelClass}>Invoice Date</label><input type="date" className={inputClass} /></div>
            </div>
          </div>
        )}

        {/* Salary details */}
        {category === "SALARY" && (
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">2</span>
              Salary Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className={labelClass}>Employee *</label>
                <select className={inputClass}><option value="">Select Employee</option></select>
              </div>
              <div><label className={labelClass}>Pay Month *</label>
                <select className={inputClass}>{["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => <option key={m}>{m}</option>)}</select>
              </div>
              <div><label className={labelClass}>Pay Year *</label>
                <input type="number" className={inputClass} defaultValue={new Date().getFullYear()} min="2020" max="2030" />
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
          <label className={labelClass}>Description *</label>
          <textarea className={inputClass} rows={3} placeholder="Brief description of this transaction..." value={description} onChange={e => setDescription(e.target.value)} />
          <div className="mt-3">
            <label className={labelClass}>Attachments</label>
            <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center hover:border-primary-300 transition-colors cursor-pointer">
              <p className="text-sm text-neutral-500">Click to upload or drag & drop</p>
              <p className="text-xs text-neutral-400 mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Link href="/transactions" className="px-6 py-3 text-sm font-medium border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">Cancel</Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Recording..." : "Record Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}
