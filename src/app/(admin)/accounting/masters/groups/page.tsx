import React from "react";
import prisma from "@/lib/prisma";
import { Plus, Edit2, Trash2 } from "lucide-react";

// For demo purposes, hardcoding a company ID that exists or grabbing the first one
async function getCompanyId() {
  const company = await prisma.company.findFirst();
  return company?.id || "";
}

export default async function GroupsMasterPage() {
  const companyId = await getCompanyId();
  
  const groups = await prisma.accountGroup.findMany({
    where: { company_id: companyId, deleted_at: null },
    include: {
      parent: true,
    },
    orderBy: [{ is_system: "desc" }, { name: "asc" }],
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Account Groups</h2>
          <p className="text-sm text-neutral-500">Manage hierarchical account groups.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div>

      <div className="overflow-x-auto border border-neutral-200 rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 text-neutral-600 font-medium border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3">Group Name</th>
              <th className="px-4 py-3">Parent Group</th>
              <th className="px-4 py-3">Nature</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {groups.map((group) => (
              <tr key={group.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-neutral-800">{group.name}</td>
                <td className="px-4 py-3 text-neutral-500">{group.parent?.name || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium
                    ${group.nature === 'ASSETS' ? 'bg-blue-50 text-blue-700' : ''}
                    ${group.nature === 'LIABILITIES' ? 'bg-red-50 text-red-700' : ''}
                    ${group.nature === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : ''}
                    ${group.nature === 'EXPENSES' ? 'bg-orange-50 text-orange-700' : ''}
                  `}>
                    {group.nature}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {group.is_system ? (
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
                    {!group.is_system && (
                      <button className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            {groups.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  No groups found. Please run the setup initialization.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
