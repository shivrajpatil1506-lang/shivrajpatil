"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { FilterBar, FilterConfig } from "@/components/shared/FilterBar";
import { formatCurrency } from "@/lib/utils";

export type FlattenedCustomer = {
  id: string;
  purchase_id: string | null;
  full_name: string;
  mobile_1: string;
  site_name: string;
  property_type: string;
  unit_number: string;
  total_amount: number;
  received_amount: number;
  pending_amount: number;
  payment_status: string;
};

export function CustomersClient({ initialData }: { initialData: FlattenedCustomer[] }) {
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const uniqueSites = useMemo(() => [...new Set(initialData.map(c => c.site_name).filter(s => s !== "—"))], [initialData]);

  const filtered = useMemo(() => {
    return initialData.filter(cust => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || (cust.full_name || "").toLowerCase().includes(q)
        || (cust.mobile_1 || "").includes(q)
        || (cust.unit_number || "").toLowerCase().includes(q)
        || (cust.site_name || "").toLowerCase().includes(q);
      const matchSite = !siteFilter || cust.site_name === siteFilter;
      const matchStatus = !statusFilter || cust.payment_status === statusFilter;
      return matchSearch && matchSite && matchStatus;
    });
  }, [initialData, search, siteFilter, statusFilter]);

  const hasFilters = !!(search || siteFilter || statusFilter);
  const clearFilters = () => { setSearch(""); setSiteFilter(""); setStatusFilter(""); };

  const totalPending = filtered.reduce((s, c) => s + (c.pending_amount || 0), 0);
  const uniqueCustomerCount = new Set(filtered.map(c => c.id)).size;

  const filters: FilterConfig[] = [
    {
      key: "site", placeholder: "All Sites", value: siteFilter, onChange: setSiteFilter,
      options: uniqueSites.map(s => ({ label: s, value: s }))
    },
    {
      key: "status", placeholder: "All Status", value: statusFilter, onChange: setStatusFilter,
      options: [
        { label: "Active", value: "active" },
        { label: "Completed", value: "completed" },
        { label: "Defaulted", value: "defaulted" },
      ]
    }
  ];

  const columns: ColumnDef<FlattenedCustomer>[] = [
    { key: "full_name", label: "Customer", sortable: true, render: (row) => <span className="font-medium text-neutral-900">{row.full_name}</span> },
    { key: "site_name", label: "Site", sortable: true, render: (row) => <span className="max-w-[140px] truncate block">{row.site_name}</span> },
    { key: "property_type", label: "Property", sortable: true, render: (row) => <span className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded font-medium">{row.property_type}</span> },
    { key: "unit_number", label: "Unit", sortable: true, render: (row) => <span className="font-mono text-xs">{row.unit_number}</span> },
    { key: "total_amount", label: "Total ₹", sortable: true, render: (row) => <span className="font-semibold tabular-nums text-neutral-900">{formatCurrency(row.total_amount)}</span> },
    { key: "received_amount", label: "Received ₹", sortable: true, render: (row) => <span className="text-emerald-600 font-semibold tabular-nums">{formatCurrency(row.received_amount)}</span> },
    { key: "pending_amount", label: "Pending ₹", sortable: true, render: (row) => <span className="text-red-600 font-semibold tabular-nums">{formatCurrency(row.pending_amount)}</span> },
    { key: "payment_status", label: "Status", sortable: true, render: (row) => <StatusBadge status={row.payment_status} /> }
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Customers"
        description={`${uniqueCustomerCount} customers (${filtered.length} bookings) ${filtered.length > 0 ? `· Pending: ${formatCurrency(totalPending)}` : ""}`}
        actions={
          <Link href="/accountant/customers/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Customer
          </Link>
        }
      />

      <FilterBar 
        searchQuery={search} 
        onSearchChange={setSearch} 
        filters={filters} 
        hasActiveFilters={hasFilters} 
        onClearFilters={clearFilters} 
      />

      <DataTable data={filtered} columns={columns} emptyMessage="No customers match your search." />
      <div className="px-4 py-3 mt-4 bg-white border border-neutral-100 rounded-xl flex items-center justify-between text-xs text-neutral-500">
        <span>Showing {filtered.length} entries</span>
        {filtered.length > 0 && (
          <span className="font-medium text-neutral-700">
            Total pending: <span className="text-red-600">{formatCurrency(totalPending)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
