"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import { createVoucher } from "@/app/actions/accounting/vouchers";
import { useRouter } from "next/navigation";

export default function VoucherEntryPage() {
  const router = useRouter();
  const [voucherType, setVoucherType] = useState("Journal");
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  const [narration, setNarration] = useState("");
  const [entries, setEntries] = useState([
    { type: "DR", ledger_id: "", amount: 0 },
    { type: "CR", ledger_id: "", amount: 0 },
  ]);

  // Mock data for UI rendering. Real app would fetch from API
  const mockLedgers = [
    { id: "L1", name: "Cash" },
    { id: "L2", name: "Bank Account" },
    { id: "L3", name: "Sales Account" },
    { id: "L4", name: "Purchase Account" },
    { id: "L5", name: "Party A (Debtor)" },
  ];

  const totalDr = entries.filter(e => e.type === "DR").reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalCr = entries.filter(e => e.type === "CR").reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const isBalanced = totalDr === totalCr && totalDr > 0;

  const addLine = () => {
    const lastType = entries[entries.length - 1]?.type;
    setEntries([...entries, { type: lastType === "DR" ? "CR" : "DR", ledger_id: "", amount: 0 }]);
  };

  const removeLine = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newEntries = [...entries];
    (newEntries[index] as any)[field] = value;
    setEntries(newEntries);
  };

  const handleSave = async () => {
    if (!isBalanced) return alert("Voucher is not balanced!");
    if (entries.some(e => !e.ledger_id)) return alert("Please select ledgers for all lines");

    // Stub: calling server action with mocked IDs for Demo
    alert("Voucher validated! Ready to save to DB.\nDebit: " + totalDr + "\nCredit: " + totalCr);
    // await createVoucher({...})
    router.push("/accounting/vouchers");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Accounting Voucher Creation</h2>
          <p className="text-sm text-neutral-500">Record a new transaction.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!isBalanced}
            className="bg-blue-600 disabled:bg-neutral-400 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Voucher
          </button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header Details */}
        <div className="bg-neutral-50 p-4 border-b border-neutral-200 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Voucher Type</label>
            <select 
              value={voucherType}
              onChange={(e) => setVoucherType(e.target.value)}
              className="w-full border-neutral-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="Journal">Journal (F7)</option>
              <option value="Receipt">Receipt (F6)</option>
              <option value="Payment">Payment (F5)</option>
              <option value="Contra">Contra (F4)</option>
              <option value="Sales">Sales (F8)</option>
              <option value="Purchase">Purchase (F9)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Voucher No.</label>
            <input type="text" disabled value="Auto" className="w-full bg-neutral-100 border-neutral-300 rounded-md sm:text-sm text-neutral-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Date</label>
            <input 
              type="date" 
              value={voucherDate}
              onChange={(e) => setVoucherDate(e.target.value)}
              className="w-full border-neutral-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
            />
          </div>
        </div>

        {/* Entry Grid */}
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-neutral-500 border-b-2 border-neutral-300 font-bold uppercase text-xs">
              <tr>
                <th className="px-2 py-2 w-20">Dr / Cr</th>
                <th className="px-2 py-2">Particulars (Ledger)</th>
                <th className="px-2 py-2 text-right w-40">Debit</th>
                <th className="px-2 py-2 text-right w-40">Credit</th>
                <th className="px-2 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx} className="border-b border-neutral-100 group">
                  <td className="px-2 py-2">
                    <select 
                      value={entry.type}
                      onChange={(e) => updateLine(idx, 'type', e.target.value)}
                      className="w-full border-transparent bg-transparent rounded font-bold focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="DR">Dr</option>
                      <option value="CR">Cr</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select 
                      value={entry.ledger_id}
                      onChange={(e) => updateLine(idx, 'ledger_id', e.target.value)}
                      className="w-full border-transparent bg-transparent rounded focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">-- Select Ledger --</option>
                      {mockLedgers.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    {entry.type === 'DR' && (
                      <input 
                        type="number" 
                        value={entry.amount || ''}
                        onChange={(e) => updateLine(idx, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full text-right border-neutral-300 rounded focus:border-blue-500 focus:ring-blue-500" 
                        placeholder="0.00"
                      />
                    )}
                  </td>
                  <td className="px-2 py-2">
                    {entry.type === 'CR' && (
                      <input 
                        type="number" 
                        value={entry.amount || ''}
                        onChange={(e) => updateLine(idx, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full text-right border-neutral-300 rounded focus:border-blue-500 focus:ring-blue-500" 
                        placeholder="0.00"
                      />
                    )}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button onClick={() => removeLine(idx)} className="text-neutral-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="px-2 py-2">
                  <button onClick={addLine} className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Line
                  </button>
                </td>
              </tr>
              <tr className="bg-neutral-50 border-t-2 border-neutral-300 font-bold">
                <td colSpan={2} className="px-4 py-3 text-right">Total:</td>
                <td className={`px-2 py-3 text-right font-mono ${totalDr !== totalCr ? 'text-red-600' : 'text-neutral-800'}`}>
                  {totalDr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className={`px-2 py-3 text-right font-mono ${totalDr !== totalCr ? 'text-red-600' : 'text-neutral-800'}`}>
                  {totalCr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Narration */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200">
          <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Narration</label>
          <textarea 
            rows={2}
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            className="w-full border-neutral-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter narration or description of the transaction..."
          />
        </div>
      </div>
    </div>
  );
}
