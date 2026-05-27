import React from "react";
import prisma from "@/lib/prisma";
import { Plus, Edit2, Trash2 } from "lucide-react";

async function getCompanyId() {
  const company = await prisma.company.findFirst();
  return company?.id || "";
}

export default async function LedgersMasterPage() {
  const companyId = await getCompanyId();
  
  const ledgers = await prisma.ledger.findMany({
    where: { company_id: companyId, deleted_at: null },
    include: {
      group: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Ledgers</h2>
          <p className="text-sm text-neutral-500">Manage individual ledger accounts.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Create Ledger
        </button>
      </div>

      <div className="overflow-x-auto border border-neutral-200 rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 text-neutral-600 font-medium border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3">Ledger Name</th>
              <th className="px-4 py-3">Under Group</th>
              <th className="px-4 py-3">Opening Bal.</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {ledgers.map((ledger) => (
              <tr key={ledger.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-neutral-800 flex items-center gap-2">
                  {ledger.name}
                  {ledger.is_party && (
                    <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Party</span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-600">{ledger.group.name}</td>
                <td className="px-4 py-3 font-mono">
                  {Number(ledger.opening_balance) !== 0 ? (
                    <span className={ledger.opening_balance_type === 'DR' ? 'text-blue-600' : 'text-emerald-600'}>
                      {Number(ledger.opening_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {ledger.opening_balance_type}
                    </span>
                  ) : (
                    <span className="text-neutral-400">0.00</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {ledger.is_system ? (
                    <span className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded-md text-xs font-medium">System</span>
                  ) : (
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-medium">Custom</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-1.5 text-neutral-400 hover:text-blue-600 transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!ledger.is_system && (
                      <button className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            {ledgers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  No ledgers found. Please run the setup initialization.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
