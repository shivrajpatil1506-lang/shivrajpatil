import React from "react";
import prisma from "@/lib/prisma";
import { Plus, Package, Edit2, Trash2 } from "lucide-react";

async function getCompanyId() {
  const company = await prisma.company.findFirst();
  return company?.id || "";
}

export default async function StockItemsMasterPage() {
  const companyId = await getCompanyId();
  
  const items = await prisma.stockItem.findMany({
    where: { company_id: companyId, deleted_at: null },
    include: {
      group: true,
      category: true,
      base_unit: true
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Stock Items</h2>
          <p className="text-sm text-neutral-500">Manage your inventory items and SKUs.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Create Stock Item
        </button>
      </div>

      <div className="overflow-x-auto border border-neutral-200 rounded-lg shadow-sm bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 text-neutral-600 font-medium border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3">Item Name</th>
              <th className="px-4 py-3">Group</th>
              <th className="px-4 py-3">Base Unit</th>
              <th className="px-4 py-3 text-right">Standard Price</th>
              <th className="px-4 py-3 text-right">GST %</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-neutral-800 flex items-center gap-2">
                  <Package className="w-4 h-4 text-neutral-400" />
                  {item.name}
                  {item.code && <span className="text-xs text-neutral-400 ml-1">({item.code})</span>}
                </td>
                <td className="px-4 py-3 text-neutral-600">{item.group?.name || "-"}</td>
                <td className="px-4 py-3 text-neutral-600">{item.base_unit?.symbol || "-"}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {item.standard_price ? Number(item.standard_price).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "-"}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {item.gst_applicable ? `${Number(item.gst_rate || 0)}%` : "N/A"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-1.5 text-neutral-400 hover:text-blue-600 transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Package className="w-10 h-10 text-neutral-300" />
                    <p>No stock items found.</p>
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
