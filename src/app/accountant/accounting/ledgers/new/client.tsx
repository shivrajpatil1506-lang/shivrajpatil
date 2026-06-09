"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { getAccountGroups } from "@/app/actions/accounting/groups";
import { createLedger } from "@/app/actions/accounting/ledgers";
import { useToast } from "@/components/ui/Toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewLedgerClient({ companies }: { companies: any[] }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [groups, setGroups] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    company_id: "",
    name: "",
    group_id: "",
    opening_balance: "0",
    opening_balance_type: "Dr",
    is_party: false,
    party_type: "",
    is_bank_account: false,
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    gstin: "",
    pan: ""
  });

  useEffect(() => {
    if (formData.company_id) {
      getAccountGroups(formData.company_id).then(res => {
        if (res.success && res.data) setGroups(res.data.flat);
      });
    } else {
      setGroups([]);
    }
  }, [formData.company_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createLedger(formData.company_id, formData);
    if (res.success) {
      success("Ledger Created", "Ledger successfully created.");
      router.push("/accountant/accounting/groups");
    } else {
      error("Error", res.error);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <PageHeader title="Create Ledger" description="Add a new ledger account to the chart of accounts." />

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Company *</label>
            <select name="company_id" required value={formData.company_id} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">Select Company...</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Under Group *</label>
            <select name="group_id" required value={formData.group_id} onChange={handleChange} disabled={!formData.company_id} className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-400">
              <option value="">Select Group...</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.nature})</option>)}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Ledger Name *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. HDFC Bank, Travel Expenses" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Opening Balance</label>
            <div className="flex">
              <input type="number" step="0.01" name="opening_balance" value={formData.opening_balance} onChange={handleChange} className="flex-1 px-4 py-2 rounded-l-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" />
              <select name="opening_balance_type" value={formData.opening_balance_type} onChange={handleChange} className="px-4 py-2 rounded-r-lg border-y border-r border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none bg-neutral-50">
                <option value="Dr">Dr</option>
                <option value="Cr">Cr</option>
              </select>
            </div>
          </div>
        </div>

        <hr className="border-neutral-100" />
        
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_party" checked={formData.is_party} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500" />
            <span className="text-sm font-medium text-neutral-700">Is this a Party Ledger? (Customer/Vendor/Employee)</span>
          </label>
          
          {formData.is_party && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6 border-l-2 border-primary-100">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Party Type</label>
                <select name="party_type" value={formData.party_type} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded-md border border-neutral-200 outline-none">
                  <option value="">Select...</option>
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">GSTIN</label>
                <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded-md border border-neutral-200 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">PAN</label>
                <input type="text" name="pan" value={formData.pan} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded-md border border-neutral-200 outline-none" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_bank_account" checked={formData.is_bank_account} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500" />
            <span className="text-sm font-medium text-neutral-700">Is this a Bank Account?</span>
          </label>

          {formData.is_bank_account && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6 border-l-2 border-primary-100">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Bank Name</label>
                <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded-md border border-neutral-200 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Account Number</label>
                <input type="text" name="account_number" value={formData.account_number} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded-md border border-neutral-200 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">IFSC Code</label>
                <input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} className="w-full px-3 py-1.5 text-sm rounded-md border border-neutral-200 outline-none" />
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Save Ledger
          </button>
        </div>
      </form>
    </div>
  );
}
