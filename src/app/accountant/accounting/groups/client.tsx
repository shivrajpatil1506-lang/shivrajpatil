"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { getAccountGroups } from "@/app/actions/accounting/groups";
import { getLedgers } from "@/app/actions/accounting/ledgers";
import { useToast } from "@/components/ui/Toast";
import { Loader2, Plus, Folder, FileText, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";

export function GroupsClient({ companies }: { companies: any[] }) {
  const { error } = useToast();
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [groupsTree, setGroupsTree] = useState<any[]>([]);
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (selectedCompanyId) {
      fetchData();
    } else {
      setGroupsTree([]);
      setLedgers([]);
    }
  }, [selectedCompanyId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gRes, lRes] = await Promise.all([
        getAccountGroups(selectedCompanyId),
        getLedgers(selectedCompanyId)
      ]);
      
      if (gRes.success && gRes.data) setGroupsTree(gRes.data.tree);
      else error("Error", gRes.error);

      if (lRes.success && lRes.data) setLedgers(lRes.data);
      else error("Error", lRes.error);
    } catch (err: any) {
      error("Error", err.message);
    }
    setLoading(false);
  };

  const toggleGroup = (id: string) => {
    const next = new Set(expandedGroups);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedGroups(next);
  };

  const renderGroup = (group: any, depth = 0) => {
    const isExpanded = expandedGroups.has(group.id);
    const groupLedgers = ledgers.filter(l => l.group_id === group.id);
    const hasChildren = group.children.length > 0 || groupLedgers.length > 0;

    return (
      <div key={group.id} className="text-sm">
        <div 
          className="flex items-center py-2 px-3 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors"
          style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
          onClick={() => toggleGroup(group.id)}
        >
          <div className="w-5 flex justify-center mr-1">
            {hasChildren ? (isExpanded ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />) : null}
          </div>
          <Folder className="w-4 h-4 text-amber-400 mr-2" />
          <span className="font-semibold text-neutral-800">{group.name}</span>
          {group.is_system && <span className="ml-2 text-[10px] font-medium bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">SYSTEM</span>}
          <span className="ml-auto text-xs text-neutral-400 uppercase tracking-wider">{group.nature}</span>
        </div>

        {isExpanded && (
          <div className="border-l border-neutral-100 ml-6">
            {group.children.map((child: any) => renderGroup(child, depth + 1))}
            {groupLedgers.map(ledger => (
              <div 
                key={ledger.id} 
                className="flex items-center py-2 px-3 hover:bg-neutral-50 rounded-lg transition-colors"
                style={{ paddingLeft: `${(depth + 1) * 1.5 + 0.75}rem` }}
              >
                <div className="w-5 mr-1" />
                <FileText className="w-4 h-4 text-primary-400 mr-2" />
                <span className="text-neutral-700">{ledger.name}</span>
                {ledger.is_system && <span className="ml-2 text-[10px] font-medium bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">SYSTEM</span>}
                {ledger.opening_balance > 0 && (
                  <span className="ml-auto text-xs font-mono font-medium text-neutral-600">
                    ₹{ledger.opening_balance.toLocaleString()} {ledger.opening_balance_type}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <PageHeader title="Chart of Accounts" description="Manage accounting groups and ledgers." />
        <div className="flex items-center gap-3">
          <Link href="/accountant/accounting/ledgers/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Ledger
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 mb-8">
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Select Company Context *</label>
        <select 
          className="w-full md:w-1/3 px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
        >
          <option value="">Select a company to view...</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {selectedCompanyId && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-2 md:p-6 min-h-[400px]">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>
          ) : groupsTree.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">
              <p>No accounting groups found.</p>
              <p className="text-sm mt-1">Go to Accounting Settings to initialize default accounts.</p>
              <Link href="/accountant/accounting/settings" className="inline-block mt-4 text-primary-600 hover:underline text-sm font-medium">Go to Settings</Link>
            </div>
          ) : (
            <div className="space-y-1">
              {groupsTree.map(group => renderGroup(group))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
