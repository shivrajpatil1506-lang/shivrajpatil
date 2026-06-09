"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { getTrialBalance } from "@/app/actions/accounting/reports";
import { useToast } from "@/components/ui/Toast";
import { Loader2, Download, Filter } from "lucide-react";

export function TrialBalanceClient({ companies }: { companies: any[] }) {
  const { error } = useToast();
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(false);
  const [selectedFyId, setSelectedFyId] = useState("");
  const [reportData, setReportData] = useState<{ entries: any[], totalDr: number, totalCr: number } | null>(null);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchReport();
    } else {
      setReportData(null);
    }
  }, [selectedCompanyId, asOfDate]);

  const fetchReport = async () => {
    setLoading(true);
    // Passing a hardcoded empty fyId if none selected to satisfy types, backend will handle it or fail gracefully
    const res = await getTrialBalance(selectedCompanyId, selectedFyId || "default-fy");
    if (res.success && res.data) {
      setReportData(res.data as any);
    } else {
      error("Error", res.error);
    }
    setLoading(false);
  };

  const handleExport = () => {
    if (!reportData) return;
    
    // Simple CSV export
    const headers = ["Ledger", "Group", "Nature", "Debit (Dr)", "Credit (Cr)"];
    const rows = reportData.entries.map(e => [
      `"${e.ledgerName}"`, 
      `"${e.groupName}"`, 
      e.nature, 
      e.dr.toFixed(2), 
      e.cr.toFixed(2)
    ]);
    
    // Add totals
    rows.push(['"TOTAL"', '""', '""', reportData.totalDr.toFixed(2), reportData.totalCr.toFixed(2)]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trial_balance_${asOfDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <PageHeader title="Trial Balance" description="View ledger balances as of a specific date." />
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            disabled={!reportData || reportData.entries.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4 md:p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Select Company Context *</label>
            <select 
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
            >
              <option value="">Select a company to view...</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">As of Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {selectedCompanyId && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>
          ) : !reportData || reportData.entries.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">
              <Filter className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p>No transactions found for this period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Particulars</th>
                    <th className="px-6 py-4 font-semibold w-40 text-right">Debit (Dr)</th>
                    <th className="px-6 py-4 font-semibold w-40 text-right">Credit (Cr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {reportData.entries.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-medium text-neutral-900">{entry.ledgerName}</div>
                        <div className="text-xs text-neutral-500">{entry.groupName} ({entry.nature})</div>
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-sm text-neutral-700">
                        {entry.dr > 0 ? entry.dr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : ""}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-sm text-neutral-700">
                        {entry.cr > 0 ? entry.cr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-primary-50 border-t-2 border-primary-100">
                  <tr>
                    <td className="px-6 py-4 font-bold text-primary-900 text-right">GRAND TOTAL</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-primary-900">
                      {reportData.totalDr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-primary-900">
                      {reportData.totalCr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
