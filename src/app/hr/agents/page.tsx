"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { FilterBar, FilterConfig } from "@/components/shared/FilterBar";
import { formatCurrency, getInitials } from "@/lib/utils";
import { getCompanies } from "@/app/actions/companies";
import { getAgents } from "@/app/actions/employees";

type AgentData = Awaited<ReturnType<typeof getAgents>>[0] & {
  totalSales: number;
  totalValue: number;
  thisMonth: number;
};

export default function HrAgentsPage() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [aData, cData] = await Promise.all([getAgents(), getCompanies()]);
    
    const agentsWithMockData = aData.map((a, i) => ({
      ...a,
      totalSales: [18, 12, 10, 6][i] || 3,
      totalValue: [82000000, 58000000, 45000000, 24000000][i] || 15000000,
      thisMonth: [3, 2, 1, 1][i] || 0,
    }));
    
    setAgents(agentsWithMockData);
    setCompanies(cData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return agents.filter(agent => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || ([agent.first_name, agent.middle_name, agent.last_name].filter(Boolean).join(" ") || "").toLowerCase().includes(q)
        || (agent.designation || "").toLowerCase().includes(q)
        || (agent.personal_mobile || "").includes(q);
      const matchCompany = !companyFilter || agent.company_id === companyFilter;
      const matchStatus = !statusFilter || agent.status === statusFilter;
      return matchSearch && matchCompany && matchStatus;
    });
  }, [search, companyFilter, statusFilter, agents]);

  const hasFilters = !!(search || companyFilter || statusFilter);
  const clearFilters = () => { setSearch(""); setCompanyFilter(""); setStatusFilter(""); };

  const filters: FilterConfig[] = [
    {
      key: "company", placeholder: "All Companies", value: companyFilter, onChange: setCompanyFilter,
      options: companies.map(c => ({ label: c.short_name || c.name, value: c.id }))
    },
    {
      key: "status", placeholder: "All Status", value: statusFilter, onChange: setStatusFilter,
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Suspended", value: "suspended" },
      ]
    }
  ];

  const columns: ColumnDef<AgentData>[] = [
    {
      key: "name", label: "Agent", sortable: true,
      sortValue: (row) => [row.first_name, row.last_name].filter(Boolean).join(" "),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {getInitials([row.first_name, row.last_name].filter(Boolean).join(" ") || "")}
          </div>
          <span className="font-medium text-neutral-900">
            {[row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ")}
          </span>
        </div>
      )
    },
    { key: "designation", label: "Designation", sortable: true },
    { key: "company", label: "Company", sortable: true, sortValue: (row) => row.company?.short_name || row.company?.name || "", render: (row) => row.company?.short_name || row.company?.name || "Unknown" },
    { key: "totalSales", label: "Total Sales", sortable: true, render: (row) => <span className="font-semibold text-blue-700 tabular-nums">{row.totalSales}</span> },
    { key: "totalValue", label: "Total Value", sortable: true, render: (row) => <span className="font-semibold text-emerald-700 tabular-nums">{formatCurrency(row.totalValue)}</span> },
    { key: "thisMonth", label: "This Month", sortable: true, render: (row) => <span className="font-semibold text-amber-700 tabular-nums">{row.thisMonth}</span> },
    { key: "status", label: "Status", sortable: true, render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Sales Agents" description={`Viewing ${filtered.length} agents`} />

      <FilterBar 
        searchQuery={search} 
        onSearchChange={setSearch} 
        filters={filters} 
        hasActiveFilters={hasFilters} 
        onClearFilters={clearFilters} 
      />

      {loading ? (
        <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>
      ) : (
        <DataTable data={filtered} columns={columns} emptyMessage="No agents match your search." />
      )}
    </div>
  );
}
