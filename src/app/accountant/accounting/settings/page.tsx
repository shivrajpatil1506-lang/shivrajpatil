"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { getCompanies } from "@/app/actions/companies";
import { getFinancialYears, createFinancialYear, setActiveFinancialYear, setupDefaultAccounts } from "@/app/actions/accounting/financial-year";
import { useToast } from "@/components/ui/Toast";
import { Loader2, Plus, CheckCircle, AlertTriangle } from "lucide-react";

export default function AccountingSettingsPage() {
  const { success, error } = useToast();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [financialYears, setFinancialYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getCompanies().then(setCompanies);
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchYears();
    } else {
      setFinancialYears([]);
    }
  }, [selectedCompanyId]);

  const fetchYears = async () => {
    setLoading(true);
    const res = await getFinancialYears(selectedCompanyId);
    if (res.success && res.data) setFinancialYears(res.data);
    setLoading(false);
  };

  const handleCreateFY = async () => {
    if (!selectedCompanyId) return;
    const yearName = prompt("Enter Financial Year Name (e.g., 2025-26):", "2025-26");
    if (!yearName) return;

    setActionLoading(true);
    // Simple logic: April 1 to March 31 of next year
    const startYear = parseInt(yearName.substring(0, 4));
    const startDate = new Date(startYear, 3, 1); // April 1
    const endDate = new Date(startYear + 1, 2, 31); // March 31

    const res = await createFinancialYear(selectedCompanyId, yearName, startDate, endDate);
    if (res.success) {
      success("Financial Year Created", `FY ${yearName} created successfully.`);
      fetchYears();
    } else {
      error("Error", res.error);
    }
    setActionLoading(false);
  };

  const handleSetActive = async (id: string) => {
    setActionLoading(true);
    const res = await setActiveFinancialYear(selectedCompanyId, id);
    if (res.success) {
      success("Active FY Changed", "The active financial year has been updated.");
      fetchYears();
    } else {
      error("Error", res.error);
    }
    setActionLoading(false);
  };

  const handleInitializeAccounts = async () => {
    if (!selectedCompanyId) return;
    if (!confirm("This will create all default Tally groups (Assets, Liabilities, Income, Expenses) and system ledgers (Cash, P&L). Proceed?")) return;

    setActionLoading(true);
    const res = await setupDefaultAccounts(selectedCompanyId);
    if (res.success) {
      success("Accounts Initialized", res.message);
    } else {
      error("Initialization Failed", res.error);
    }
    setActionLoading(false);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <PageHeader title="Accounting Settings" description="Manage financial years and chart of accounts initialization." />

      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 mb-8">
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Select Company Context *</label>
        <select 
          className="w-full md:w-1/2 px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
        >
          <option value="">Select a company to manage...</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {selectedCompanyId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Financial Years */}
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Financial Years</h3>
              <button onClick={handleCreateFY} disabled={actionLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add FY
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
            ) : financialYears.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-600 font-medium">No Financial Years found.</p>
                <p className="text-xs text-neutral-500 mt-1">Create one to start recording vouchers.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {financialYears.map(fy => (
                  <div key={fy.id} className={`flex items-center justify-between p-4 rounded-lg border ${fy.is_active ? 'bg-primary-50 border-primary-200' : 'border-neutral-100 bg-white'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-neutral-900">{fy.name}</span>
                        {fy.is_active && <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-700 rounded-full">Active</span>}
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{new Date(fy.start_date).toLocaleDateString()} — {new Date(fy.end_date).toLocaleDateString()}</p>
                    </div>
                    {!fy.is_active && (
                      <button onClick={() => handleSetActive(fy.id)} disabled={actionLoading} className="text-xs font-medium text-neutral-500 hover:text-primary-600 transition-colors">
                        Set Active
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Initialization */}
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
            <h3 className="font-bold text-neutral-900 mb-4" style={{ fontFamily: "var(--font-heading)" }}>Chart of Accounts</h3>
            <p className="text-sm text-neutral-600 mb-6">
              Before you can record vouchers, the system needs default accounting groups (Assets, Liabilities, Income, Expenses) and basic ledgers like Cash.
            </p>
            <button 
              onClick={handleInitializeAccounts} 
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-70"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Initialize Default Accounts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
