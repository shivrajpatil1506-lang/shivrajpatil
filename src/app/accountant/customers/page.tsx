"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { FilterBar, FilterConfig } from "@/components/shared/FilterBar";
import { formatCurrency } from "@/lib/utils";
import { getCustomers } from "@/app/actions/customers";

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
};

export default function AccountantCustomersPage() {
  const [customersData, setCustomersData] = useState<FlattenedCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const data = await getCustomers();
    const flat = data.flatMap(c => {
      const fullName = [c.first_name, c.middle_name, c.last_name].filter(Boolean).join(" ");
      
      if ((c as any).purchases && (c as any).purchases.length > 0) {
        return (c as any).purchases.map((p: any) => {
          const received = ((c as any).transactions || []).reduce((sum: number, t: any) => sum + t.amount, 0);
          const total = p.total_agreement_value || 0;
          return {
            id: c.id,
            purchase_id: p.id,
            full_name: fullName,
            mobile_1: c.mobile_1,
            site_name: p.site?.name || "N/A",
            property_type: p.unit?.property_type || "N/A",
            unit_number: p.unit?.unit_number || "N/A",
            total_amount: total,
            received_amount: received,
            pending_amount: Math.max(0, total - received),
            payment_status: p.status,
          };
        });
      } else {
        return [{
          id: c.id, purchase_id: null, full_name: fullName, mobile_1: c.mobile_1,
          site_name: "—", property_type: "—", unit_number: "—",
          total_amount: 0, received_amount: 0, pending_amount: 0,
          payment_status: "active",
        }];
      }
    });
    setCustomersData(flat);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    { key: "mobile_1", label: "Mobile", sortable: false, render: (row) => <span className="tabular-nums">{row.mobile_1}</span> },
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
        description={loading ? "Loading customers..." : `${uniqueCustomerCount} customers (${filtered.length} bookings) ${filtered.length > 0 ? `· Pending: ${formatCurrency(totalPending)}` : ""}`}
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

      {loading ? (
        <div className="py-24 flex justify-center"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>
      ) : (
        <>
          <DataTable data={filtered} columns={columns} emptyMessage="No customers match your search." />
          <div className="px-4 py-3 mt-4 bg-white border border-neutral-100 rounded-xl flex items-center justify-between text-xs text-neutral-500">
            <span>Showing {filtered.length} entries</span>
            {filtered.length > 0 && (
              <span className="font-medium text-neutral-700">
                Total pending: <span className="text-red-600">{formatCurrency(totalPending)}</span>
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
