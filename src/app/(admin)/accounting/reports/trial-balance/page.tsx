import React from "react";
import prisma from "@/lib/prisma";
import { generateTrialBalance } from "@/app/actions/accounting/reports";

async function getContext() {
  const company = await prisma.company.findFirst();
  const fy = await prisma.financialYear.findFirst({
    where: { company_id: company?.id }
  });
  return { companyId: company?.id || "", fyId: fy?.id || "" };
}

// Recursive component to render the tree
const GroupRow = ({ node, level = 0 }: { node: any, level?: number }) => {
  const paddingLeft = `${level * 1.5 + 1}rem`;
  
  return (
    <>
      <tr className="hover:bg-neutral-50 border-b border-neutral-100">
        <td className="px-4 py-2" style={{ paddingLeft }}>
          <span className="font-semibold text-neutral-800">{node.name}</span>
        </td>
        <td className="px-4 py-2 text-right font-mono text-sm">
          {node.closing_dr > 0 ? node.closing_dr.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : ""}
        </td>
        <td className="px-4 py-2 text-right font-mono text-sm">
          {node.closing_cr > 0 ? node.closing_cr.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : ""}
        </td>
      </tr>
      
      {/* Render Ledgers */}
      {node.ledgers?.map((ledger: any) => (
        <tr key={ledger.id} className="hover:bg-neutral-50 text-neutral-600 border-b border-neutral-50">
          <td className="px-4 py-1.5" style={{ paddingLeft: `${(level + 1) * 1.5 + 1}rem` }}>
            <span className="italic">{ledger.name}</span>
          </td>
          <td className="px-4 py-1.5 text-right font-mono text-xs">
            {ledger.closing_dr > 0 ? ledger.closing_dr.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : ""}
          </td>
          <td className="px-4 py-1.5 text-right font-mono text-xs">
            {ledger.closing_cr > 0 ? ledger.closing_cr.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : ""}
          </td>
        </tr>
      ))}

      {/* Render Children Groups */}
      {node.children?.map((child: any) => (
        <GroupRow key={child.id} node={child} level={level + 1} />
      ))}
    </>
  );
};

export default async function TrialBalancePage() {
  const { companyId, fyId } = await getContext();
  
  if (!companyId || !fyId) {
    return <div className="p-6 text-red-500">Missing Company or Financial Year context. Please run setup.</div>;
  }

  const result = await generateTrialBalance(companyId, fyId);

  if (!result.success) {
    return <div className="p-6 text-red-500">Error generating Trial Balance: {result.error}</div>;
  }

  const { tree, grandTotalDr, grandTotalCr } = result.data as any;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Trial Balance</h2>
          <p className="text-sm text-neutral-500">As of current financial year.</p>
        </div>
        <button className="bg-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Print / Export
        </button>
      </div>

      <div className="overflow-x-auto border border-neutral-200 rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-100 text-neutral-700 font-bold border-b-2 border-neutral-200">
            <tr>
              <th className="px-4 py-3">Particulars</th>
              <th className="px-4 py-3 text-right w-48">Debit (Dr)</th>
              <th className="px-4 py-3 text-right w-48">Credit (Cr)</th>
            </tr>
          </thead>
          <tbody>
            {tree.map((rootNode: any) => (
              <GroupRow key={rootNode.id} node={rootNode} />
            ))}
          </tbody>
          <tfoot className="bg-neutral-100 text-neutral-800 font-bold border-t-2 border-neutral-300">
            <tr>
              <td className="px-4 py-4 text-right">Grand Total:</td>
              <td className="px-4 py-4 text-right font-mono text-base text-blue-700">
                {grandTotalDr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-4 text-right font-mono text-base text-emerald-700">
                {grandTotalCr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
