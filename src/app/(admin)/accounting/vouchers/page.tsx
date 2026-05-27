import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Filter, Download, FileText } from "lucide-react";

async function getCompanyId() {
  const company = await prisma.company.findFirst();
  return company?.id || "";
}

export default async function VouchersListingPage() {
  const companyId = await getCompanyId();
  
  const vouchers = await prisma.voucher.findMany({
    where: { company_id: companyId },
    include: {
      voucher_type: true,
      journal_entries: {
        include: { ledger: true }
      }
    },
    orderBy: { voucher_date: "desc" },
    take: 50
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Daybook & Vouchers</h2>
          <p className="text-sm text-neutral-500">View and manage all accounting transactions.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <Link href="/accounting/vouchers/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            New Voucher
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto border border-neutral-200 rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 text-neutral-600 font-medium border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Voucher No.</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Particulars</th>
              <th className="px-4 py-3 text-right">Debit</th>
              <th className="px-4 py-3 text-right">Credit</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {vouchers.map((voucher) => (
              <tr key={voucher.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-neutral-800">
                  {voucher.voucher_date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-blue-600 font-medium hover:underline cursor-pointer">
                  {voucher.voucher_number}
                </td>
                <td className="px-4 py-3">
                  <span className="bg-neutral-100 text-neutral-700 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider">
                    {voucher.voucher_type.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600 italic">
                  {/* Just showing the first ledger involved for brevity */}
                  {voucher.journal_entries[0]?.ledger?.name || "Multiple"}
                  {voucher.journal_entries.length > 1 && ` + ${voucher.journal_entries.length - 1} more`}
                </td>
                <td className="px-4 py-3 text-right font-mono text-neutral-700">
                  {Number(voucher.total_debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right font-mono text-neutral-700">
                  {Number(voucher.total_credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold
                    ${voucher.status === 'POSTED' ? 'bg-emerald-100 text-emerald-800' : ''}
                    ${voucher.status === 'DRAFT' ? 'bg-amber-100 text-amber-800' : ''}
                    ${voucher.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {voucher.status}
                  </span>
                </td>
              </tr>
            ))}
            
            {vouchers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FileText className="w-10 h-10 text-neutral-300" />
                    <p>No vouchers recorded yet.</p>
                    <Link href="/accounting/vouchers/new" className="text-blue-600 font-medium hover:underline">
                      Create your first voucher
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
