import React from "react";
import prisma from "@/lib/prisma";
import { generateBalanceSheet } from "@/app/actions/accounting/reports";

async function getContext() {
  const company = await prisma.company.findFirst();
  const fy = await prisma.financialYear.findFirst({
    where: { company_id: company?.id }
  });
  return { companyId: company?.id || "", fyId: fy?.id || "" };
}

// Flat renderer for simplicity
const GroupRow = ({ node, isAsset }: { node: any, isAsset: boolean }) => {
  const balance = isAsset 
    ? (node.closing_dr || 0) - (node.closing_cr || 0)
    : (node.closing_cr || 0) - (node.closing_dr || 0);

  if (balance === 0 && (!node.children || node.children.length === 0)) return null;

  return (
    <>
      <div className="flex justify-between py-2 border-b border-neutral-100 hover:bg-neutral-50 px-2 rounded transition-colors">
        <span className="font-semibold text-neutral-800">{node.name}</span>
        <span className="font-mono text-sm">{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
      {/* Recursively render children here for a full tree */}
    </>
  );
};

export default async function BalanceSheetPage() {
  const { companyId, fyId } = await getContext();
  
  if (!companyId || !fyId) {
    return <div className="p-6 text-red-500">Missing Company or Financial Year context. Please run setup.</div>;
  }

  const result = await generateBalanceSheet(companyId, fyId);

  if (!result.success) {
    return <div className="p-6 text-red-500">Error generating Balance Sheet: {result.error}</div>;
  }

  const { assets, liabilities, totalAssets, totalLiabilities, netProfit } = result.data as any;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Balance Sheet</h2>
          <p className="text-sm text-neutral-500">As of current financial year closing.</p>
        </div>
        <button className="bg-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Print / Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Liabilities */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
          <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200 font-bold text-neutral-700 flex justify-between">
            <span>Liabilities</span>
          </div>
          <div className="p-4 flex-1">
            {liabilities.map((node: any) => (
              <GroupRow key={node.id} node={node} isAsset={false} />
            ))}
            {/* Display Net Profit on Liability side if positive, or deduction if negative */}
            <div className="flex justify-between py-2 border-b border-neutral-100 hover:bg-neutral-50 px-2 rounded transition-colors mt-2">
              <span className="font-semibold text-neutral-800">Profit & Loss A/c</span>
              <span className="font-mono text-sm text-blue-600">{netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-200 font-bold flex justify-between text-lg">
            <span>Total Liabilities</span>
            <span className="font-mono text-emerald-700">{totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Right Side: Assets */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
          <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200 font-bold text-neutral-700 flex justify-between">
            <span>Assets</span>
          </div>
          <div className="p-4 flex-1">
            {assets.map((node: any) => (
              <GroupRow key={node.id} node={node} isAsset={true} />
            ))}
          </div>
          <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-200 font-bold flex justify-between text-lg">
            <span>Total Assets</span>
            <span className="font-mono text-emerald-700">{totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Difference Check */}
      {Math.abs(totalAssets - totalLiabilities) > 0.01 && (
        <div className="mt-6 p-4 rounded-xl border bg-red-50 border-red-200">
          <h3 className="text-xl font-bold text-red-800">Balance Sheet mismatch!</h3>
          <p className="text-sm text-red-600">Difference in Opening Balances: ₹ {Math.abs(totalAssets - totalLiabilities).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
      )}

    </div>
  );
}
