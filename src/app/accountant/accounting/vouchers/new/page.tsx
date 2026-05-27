"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { getCompanies } from "@/app/actions/companies";
import { getLedgers } from "@/app/actions/accounting/ledgers";
import { createVoucher } from "@/app/actions/accounting/vouchers";
import { useToast } from "@/components/ui/Toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewVoucherPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [companies, setCompanies] = useState<any[]>([]);
  const [ledgers, setLedgers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    company_id: "",
    voucher_type: "journal",
    date: new Date().toISOString().split('T')[0],
    narration: "",
    reference_no: "",
  });

  const [entries, setEntries] = useState([
    { type: "Dr", ledger_id: "", amount: "" },
    { type: "Cr", ledger_id: "", amount: "" }
  ]);

  useEffect(() => {
    getCompanies().then(setCompanies);
  }, []);

  useEffect(() => {
    if (formData.company_id) {
      getLedgers(formData.company_id).then(res => {
        if (res.success && res.data) setLedgers(res.data);
      });
    } else {
      setLedgers([]);
    }
  }, [formData.company_id]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEntryChange = (index: number, field: string, value: string) => {
    const newEntries = [...entries];
    (newEntries[index] as any)[field] = value;
    setEntries(newEntries);
  };

  const addEntry = () => {
    setEntries([...entries, { type: "Dr", ledger_id: "", amount: "" }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length <= 2) return;
    setEntries(entries.filter((_, i) => i !== index));
  };

  const totalDr = entries.filter(e => e.type === "Dr").reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const totalCr = entries.filter(e => e.type === "Cr").reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const diff = Math.abs(totalDr - totalCr);
  const isBalanced = diff < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      error("Unbalanced Voucher", "Debit and Credit totals must match exactly.");
      return;
    }
    if (entries.some(e => !e.ledger_id || !e.amount || parseFloat(e.amount) <= 0)) {
      error("Invalid Entries", "All entries must have a ledger selected and a valid amount greater than 0.");
      return;
    }

    setLoading(true);
    const formattedEntries = entries.map(e => ({
      entry_type: e.type as "DR" | "CR",
      ledger_id: e.ledger_id,
      amount: Number(e.amount) || 0
    }));

    const res = await createVoucher({
      company_id: formData.company_id,
      financial_year_id: "default-fy",
      voucher_type_id: "default-vt",
      voucher_date: new Date(formData.date),
      reference_number: formData.reference_no,
      narration: formData.narration,
      entries: formattedEntries
    });
    
    if (res.success && res.data) {
      success("Voucher Saved", `Voucher ${res.data.voucher_number} created successfully.`);
      router.push("/accountant/accounting"); // or vouchers list
    } else {
      error("Error", res.error);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <PageHeader title="Create Voucher" description="Record an accounting entry." />

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Company *</label>
            <select name="company_id" required value={formData.company_id} onChange={handleFormChange} className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">Select Company...</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Voucher Type *</label>
            <select name="voucher_type" required value={formData.voucher_type} onChange={handleFormChange} className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="journal">Journal</option>
              <option value="receipt">Receipt</option>
              <option value="payment">Payment</option>
              <option value="sales">Sales</option>
              <option value="purchase">Purchase</option>
              <option value="contra">Contra</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Date *</label>
            <input type="date" name="date" required value={formData.date} onChange={handleFormChange} className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
        </div>

        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold w-24">Dr/Cr</th>
                <th className="px-4 py-3 font-semibold">Particulars (Ledger)</th>
                <th className="px-4 py-3 font-semibold w-40 text-right">Debit (Dr)</th>
                <th className="px-4 py-3 font-semibold w-40 text-right">Credit (Cr)</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {entries.map((entry, idx) => (
                <tr key={idx} className="bg-white">
                  <td className="px-4 py-2">
                    <select 
                      value={entry.type} 
                      onChange={(e) => handleEntryChange(idx, "type", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm rounded border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="Dr">Dr</option>
                      <option value="Cr">Cr</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <select 
                      value={entry.ledger_id} 
                      onChange={(e) => handleEntryChange(idx, "ledger_id", e.target.value)}
                      disabled={!formData.company_id}
                      className="w-full px-2 py-1.5 text-sm rounded border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none"
                      required
                    >
                      <option value="">Select Ledger...</option>
                      {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    {entry.type === "Dr" ? (
                      <input 
                        type="number" step="0.01" min="0" required
                        value={entry.amount} 
                        onChange={(e) => handleEntryChange(idx, "amount", e.target.value)}
                        className="w-full px-2 py-1.5 text-sm text-right rounded border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    ) : null}
                  </td>
                  <td className="px-4 py-2">
                    {entry.type === "Cr" ? (
                      <input 
                        type="number" step="0.01" min="0" required
                        value={entry.amount} 
                        onChange={(e) => handleEntryChange(idx, "amount", e.target.value)}
                        className="w-full px-2 py-1.5 text-sm text-right rounded border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    ) : null}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button type="button" onClick={() => removeEntry(idx)} disabled={entries.length <= 2} className="text-neutral-400 hover:text-red-500 disabled:opacity-30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-neutral-50 border-t border-neutral-200">
              <tr>
                <td colSpan={2} className="px-4 py-3">
                  <button type="button" onClick={addEntry} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Row
                  </button>
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-neutral-900">
                  {totalDr.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-neutral-900">
                  {totalCr.toFixed(2)}
                </td>
                <td></td>
              </tr>
              {!isBalanced && (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-center bg-red-50 text-red-600 text-xs font-semibold">
                    Difference: {diff.toFixed(2)} (Debit and Credit must match)
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Narration</label>
            <textarea name="narration" value={formData.narration} onChange={handleFormChange} rows={3} className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Enter voucher details..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Reference No.</label>
            <input type="text" name="reference_no" value={formData.reference_no} onChange={handleFormChange} className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Invoice #, Cheque #" />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading || !isBalanced} className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Save Voucher
          </button>
        </div>
      </form>
    </div>
  );
}
