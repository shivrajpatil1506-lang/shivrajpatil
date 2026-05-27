import React from "react";
import prisma from "@/lib/prisma";
import { generateProfitAndLoss } from "@/app/actions/accounting/reports";

async function getContext() {
  const company = await prisma.company.findFirst();
  const fy = await prisma.financialYear.findFirst({
    where: { company_id: company?.id }
  });
  return { companyId: company?.id || "", fyId: fy?.id || "" };
}

// Flat renderer for simplicity in P&L
const GroupRow = ({ node, isIncome }: { node: any, isIncome: boolean }) => {
  const balance = isIncome 
    ? (node.closing_cr || 0) - (node.closing_dr || 0)
    : (node.closing_dr || 0) - (node.closing_cr || 0);

  if (balance === 0 && (!node.children || node.children.length === 0)) return null;

  return (
    <>
      <div className="flex justify-between py-2 border-b border-neutral-100 hover:bg-neutral-50 px-2 rounded transition-colors">
        <span className="font-semibold text-neutral-800">{node.name}</span>
        <span className="font-mono text-sm">{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
      {/* We could recursively render children here as well, similar to Trial Balance */}
    </>
  );
};

export default async function ProfitLossPage() {
  const { companyId, fyId } = await getContext();
  
  if (!companyId || !fyId) {
    return <div className="p-6 text-red-500">Missing Company or Financial Year context. Please run setup.</div>;
  }

  const result = await generateProfitAndLoss(companyId, fyId);

  if (!result.success) {
    return <div className="p-6 text-red-500">Error generating P&L: {result.error}</div>;
  }

  const { income, expenses, totalIncome, totalExpense, netProfit } = result.data as any;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Profit & Loss Account</h2>
          <p className="text-sm text-neutral-500">For the current financial year.</p>
        </div>
        <button className="bg-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Print / Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Expenses (Particulars - Dr) */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
          <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200 font-bold text-neutral-700 flex justify-between">
            <span>Particulars (Expenses)</span>
          </div>
          <div className="p-4 flex-1">
            {expenses.map((node: any) => (
              <GroupRow key={node.id} node={node} isIncome={false} />
            ))}
          </div>
          <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-200 font-bold flex justify-between text-lg">
            <span>Total Expenses</span>
            <span className="font-mono text-orange-700">{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Right Side: Income (Particulars - Cr) */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
          <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200 font-bold text-neutral-700 flex justify-between">
            <span>Particulars (Income)</span>
          </div>
          <div className="p-4 flex-1">
            {income.map((node: any) => (
              <GroupRow key={node.id} node={node} isIncome={true} />
            ))}
          </div>
          <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-200 font-bold flex justify-between text-lg">
            <span>Total Income</span>
            <span className="font-mono text-emerald-700">{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Net Result Bar */}
      <div className={`mt-6 p-6 rounded-xl border flex justify-between items-center ${netProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
        <div>
          <h3 className={`text-xl font-black ${netProfit >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
            {netProfit >= 0 ? 'Nett Profit' : 'Nett Loss'}
          </h3>
          <p className={`text-sm mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            Transferred to Balance Sheet
          </p>
        </div>
        <div className={`text-4xl font-mono font-bold tracking-tight ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          ₹ {Math.abs(netProfit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </div>

    </div>
  );
}
