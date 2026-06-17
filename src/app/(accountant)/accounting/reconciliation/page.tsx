"use client";

import React, { useState, useEffect } from "react";
import { getUnreconciledBankLines, reconcileBankLine } from "@/app/actions/accounting/reconciliation";
import { useAuthStore } from "@/stores/auth-store";
import { format } from "date-fns";
import { CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type BankLine = {
  id: string;
  voucher_number: string;
  voucher_date: string;
  ledger_name: string;
  amount: number;
  entry_type: string;
  narration: string | null;
};

export default function BankReconciliationPage() {
  const { currentCompany } = useAuthStore();
  const { success, error } = useToast();
  const [lines, setLines] = useState<BankLine[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for the row being edited
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);
  const [bankDate, setBankDate] = useState<string>("");
  const [bankTxnId, setBankTxnId] = useState<string>("");

  useEffect(() => {
    if (currentCompany?.id) {
      loadLines();
    }
  }, [currentCompany?.id]);

  const loadLines = async () => {
    if (!currentCompany) return;
    setLoading(true);
    const data = await getUnreconciledBankLines(currentCompany.id);
    setLines(data);
    setLoading(false);
  };

  const handleReconcile = async (id: string) => {
    if (!bankDate) {
      error("Bank Date is required for reconciliation");
      return;
    }

    const res = await reconcileBankLine(id, new Date(bankDate), bankTxnId);
    if (res.success) {
      success("Transaction reconciled successfully");
      setReconcilingId(null);
      setBankDate("");
      setBankTxnId("");
      loadLines();
    } else {
      error(res.error || "Failed to reconcile");
    }
  };

  const startReconciling = (id: string) => {
    setReconcilingId(id);
    setBankDate(new Date().toISOString().split('T')[0]); // Default to today
    setBankTxnId("");
  };

  if (!currentCompany) {
    return <div className="p-8 text-center text-gray-500">Please select a company first.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Reconciliation</h1>
          <p className="text-gray-500 text-sm mt-1">Match system entries with your bank statement.</p>
        </div>
        <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-md flex items-center border border-amber-200">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">{lines.length} Unreconciled Entries</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : lines.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
          <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
          <p className="text-gray-500 mt-2">There are no unreconciled bank entries for {currentCompany.name}.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Voucher</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ledger & Narration</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action / Reconcile Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lines.map((line) => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{format(new Date(line.voucher_date), 'dd MMM yyyy')}</div>
                    <div className="text-xs text-gray-500">{line.voucher_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{line.ledger_name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs" title={line.narration || ""}>
                      {line.narration || "No narration"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-bold ${line.entry_type === 'DR' ? 'text-success-600' : 'text-danger-600'}`}>
                      {line.entry_type === 'DR' ? '+' : '-'} ₹{line.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reconcilingId === line.id ? (
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="date" 
                            className="block w-36 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 border p-1"
                            value={bankDate}
                            onChange={(e) => setBankDate(e.target.value)}
                          />
                          <input 
                            type="text" 
                            placeholder="Bank Ref / Txn ID" 
                            className="block w-40 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 border p-1"
                            value={bankTxnId}
                            onChange={(e) => setBankTxnId(e.target.value)}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleReconcile(line.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setReconcilingId(null)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startReconciling(line.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5 text-gray-400" />
                        Reconcile
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
