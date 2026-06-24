"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { FilterBar, FilterConfig } from "@/components/shared/FilterBar";
import { formatCurrency, formatDate } from "@/lib/utils";

type FlattenedCustomer = {
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
  booking_date: Date | null;
};

export function CustomersClient({ initialCustomers }: { initialCustomers: FlattenedCustomer[] }) {
  const [customersData] = useState<FlattenedCustomer[]>(initialCustomers);

  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const uniqueSites = useMemo(() => [...new Set(customersData.map(c => c.site_name).filter(s => s !== "—"))], [customersData]);

  const filtered = useMemo(() => {
    return customersData.filter(cust => {
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
  }, [customersData, search, siteFilter, statusFilter]);

  const hasFilters = !!(search || siteFilter || statusFilter);
  const clearFilters = () => { setSearch(""); setSiteFilter(""); setStatusFilter(""); };

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
    { key: "booking_date", label: "Booking", sortable: true, sortValue: (row) => row.booking_date ? new Date(row.booking_date).getTime() : 0, render: (row) => <span className="tabular-nums">{row.booking_date ? formatDate(row.booking_date) : "—"}</span> },
    { key: "total_amount", label: "Total ₹", sortable: true, render: (row) => <span className="font-semibold tabular-nums text-neutral-900">{formatCurrency(row.total_amount)}</span> },
    { key: "received_amount", label: "Received ₹", sortable: true, render: (row) => <span className="text-emerald-600 font-semibold tabular-nums">{formatCurrency(row.received_amount)}</span> },
    { key: "payment_status", label: "Status", sortable: true, render: (row) => <StatusBadge status={row.payment_status} /> }
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My Customers"
        description={`${uniqueCustomerCount} customers in your portfolio`}
        actions={
          <Link href="/agent/customers/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
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

      <>
        <DataTable data={filtered} columns={columns} emptyMessage="No customers match your search." />
        <div className="px-4 py-3 mt-4 bg-white border border-neutral-100 rounded-xl flex items-center justify-between text-xs text-neutral-500">
          <span>Showing {filtered.length} entries</span>
        </div>
      </>
    </div>
  );
}
