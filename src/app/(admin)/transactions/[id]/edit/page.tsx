"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { getCompanies } from "@/app/actions/companies";
import { getTransactionById, updateTransaction } from "@/app/actions/transactions";
import { CATEGORY_LABELS } from "@/lib/constants";

export default function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    transaction_date: "",
    company_id: "",
    category: "",
    amount: "",
    payment_mode: "",
    reference_no: "",
    status: "",
    notes: ""
  });

  useEffect(() => {
    getCompanies().then(setCompanies);

    getTransactionById(id).then(txn => {
      if (txn) {
        setFormData({
          transaction_date: txn.transaction_date ? new Date(txn.transaction_date).toISOString().split('T')[0] : "",
          company_id: txn.company_id || "",
          category: txn.category || "",
          amount: txn.amount?.toString() || "",
          payment_mode: txn.payment_mode || "bank_transfer",
          reference_no: txn.reference_no || "",
          status: txn.status || "completed",
          notes: txn.notes || ""
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateTransaction(id, {
        transaction_date: formData.transaction_date ? new Date(formData.transaction_date) : undefined,
        company_id: formData.company_id,
        category: formData.category,
        amount: parseFloat(formData.amount),
        payment_mode: formData.payment_mode,
        reference_no: formData.reference_no,
        status: formData.status,
        notes: formData.notes
      });
      
      success("Transaction Updated", "The transaction has been successfully updated.");
      router.push(`/transactions/${id}`);
    } catch (err) {
      console.error(err);
      error("Error", "An unexpected error occurred while updating the transaction.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white";
  const labelClass = "block text-sm font-medium text-neutral-700 mb-1.5";

  if (loading) {
    return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link href={`/transactions/${id}`} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Transaction
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Edit Transaction</h1>
        <p className="text-neutral-500 text-sm mt-1">Update transaction details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-neutral-500" />
            <h2 className="font-semibold text-neutral-800">Transaction Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className={labelClass}>Date *</label><input required type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Company *</label>
              <select required name="company_id" value={formData.company_id} onChange={handleChange} className={inputClass}>
                <option value="">Select Company</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Category *</label>
              <select required name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                <option value="">Select Category</option>
                {Object.entries(CATEGORY_LABELS).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Amount (₹) *</label><input required type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Payment Mode *</label>
              <select required name="payment_mode" value={formData.payment_mode} onChange={handleChange} className={inputClass}>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <div><label className={labelClass}>Reference No.</label><input name="reference_no" value={formData.reference_no} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Status *</label>
              <select required name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="md:col-span-2"><label className={labelClass}>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link href={`/transactions/${id}`} className="px-6 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-70">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}
