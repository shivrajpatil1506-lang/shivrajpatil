import React from "react";
import prisma from "@/lib/prisma";
import { FolderTree, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

async function getCompanyId() {
  const company = await prisma.company.findFirst();
  return company?.id || "";
}

// Build hierarchy helper
async function getGroupHierarchy(companyId: string) {
  const groups = await prisma.accountGroup.findMany({
    where: { company_id: companyId, deleted_at: null },
    orderBy: { sequence_no: "asc" }
  });

  const ledgers = await prisma.ledger.findMany({
    where: { company_id: companyId, deleted_at: null },
    orderBy: { name: "asc" }
  });

  const groupMap = new Map();
  groups.forEach(g => groupMap.set(g.id, { ...g, children: [], ledgers: [] }));
  ledgers.forEach(l => {
    const parent = groupMap.get(l.group_id);
    if (parent) parent.ledgers.push(l);
  });

  const rootGroups: any[] = [];
  groupMap.forEach(g => {
    if (g.parent_id) {
      const parent = groupMap.get(g.parent_id);
      if (parent) parent.children.push(g);
    } else {
      rootGroups.push(g);
    }
  });

  return rootGroups;
}

const TreeNode = ({ node, level = 0 }: { node: any, level?: number }) => {
  const paddingLeft = `${level * 2}rem`;

  return (
    <div className="flex flex-col">
      <div 
        className="flex items-center gap-3 py-2 px-4 hover:bg-neutral-50 border-b border-neutral-100 transition-colors"
        style={{ paddingLeft: `calc(1rem + ${paddingLeft})` }}
      >
        <FolderTree className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <span className="font-semibold text-neutral-800">{node.name}</span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">Group</span>
        {node.nature && <span className="text-xs text-neutral-400 ml-auto">{node.nature}</span>}
      </div>

      {node.ledgers.map((ledger: any) => (
        <div 
          key={ledger.id} 
          className="flex items-center gap-3 py-2 px-4 hover:bg-emerald-50/50 border-b border-neutral-50 transition-colors"
          style={{ paddingLeft: `calc(3rem + ${paddingLeft})` }}
        >
          <Users className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-neutral-700">{ledger.name}</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Ledger</span>
          {ledger.is_party && <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Party</span>}
        </div>
      ))}

      {node.children.map((child: any) => (
        <TreeNode key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  );
};

export default async function ChartOfAccountsTreePage() {
  const companyId = await getCompanyId();
  const tree = await getGroupHierarchy(companyId);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Chart of Accounts (Tree View)</h2>
          <p className="text-sm text-neutral-500">Hierarchical view of all groups and ledgers.</p>
        </div>
        <Link href="/accounting/masters/groups" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
          Back to List <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {tree.map(root => (
          <TreeNode key={root.id} node={root} />
        ))}
        {tree.length === 0 && (
          <div className="p-8 text-center text-neutral-500">
            No accounts found.
          </div>
        )}
      </div>
    </div>
  );
}
