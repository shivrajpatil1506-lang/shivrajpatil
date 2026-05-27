"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { FilterBar, FilterConfig } from "@/components/shared/FilterBar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getTransactionsForCurrentUser } from "@/app/actions/transactions";

type TransactionData = Awaited<ReturnType<typeof getTransactionsForCurrentUser>>[0];

export default function AgentSalesPage() {
  const [sales, setSales] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("All Time");

  const fetchData = async () => {
    setLoading(true);
    const txns = await getTransactionsForCurrentUser();
    setSales(txns.filter(t => t.category === "PROPERTY_SALE"));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    return sales.filter(txn => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || txn.transaction_code.toLowerCase().includes(q)
        || (txn.description || "").toLowerCase().includes(q)
        || (txn.customer_name || "").toLowerCase().includes(q);
      const matchStatus = !statusFilter || txn.status === statusFilter;

      let matchDate = true;
      const d = new Date(txn.transaction_date);
      if (dateFilter === "Today") {
        matchDate = d.toDateString() === now.toDateString();
      } else if (dateFilter === "This Week") {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
        matchDate = d >= weekAgo;
      } else if (dateFilter === "This Month") {
        matchDate = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }

      return matchSearch && matchDate && matchStatus;
    });
  }, [search, dateFilter, statusFilter, sales]);

  const hasFilters = !!(search || dateFilter !== "All Time" || statusFilter);
  const clearFilters = () => { setSearch(""); setDateFilter("All Time"); setStatusFilter(""); };

  const totalValue = filtered.filter(t => t.status !== "cancelled").reduce((sum, t) => sum + t.amount, 0);

  const filters: FilterConfig[] = [
    {
      key: "date", placeholder: "All Time", value: dateFilter, onChange: setDateFilter,
      options: [
        { label: "Today", value: "Today" },
        { label: "This Week", value: "This Week" },
        { label: "This Month", value: "This Month" },
      ]
    },
    {
      key: "status", placeholder: "All Status", value: statusFilter, onChange: setStatusFilter,
      options: [
        { label: "Completed", value: "completed" },
        { label: "Pending", value: "pending" },
        { label: "Cancelled", value: "cancelled" },
      ]
    }
  ];

  const columns: ColumnDef<TransactionData>[] = [
    { key: "transaction_date", label: "Date", sortable: true, sortValue: (row) => new Date(row.transaction_date).getTime(), render: (row) => <span className="tabular-nums text-xs">{formatDate(row.transaction_date)}</span> },
    { key: "customer_name", label: "Customer", sortable: true, render: (row) => <span className="font-medium text-neutral-900">{row.customer_name || "—"}</span> },
    { key: "company_name", label: "Company", sortable: true, render: (row) => <span className="text-xs">{row.company_name}</span> },
    { key: "description", label: "Description", sortable: false, render: (row) => <span className="max-w-[200px] truncate block text-xs text-neutral-700">{row.description}</span> },
    { key: "amount", label: "Amount ₹", sortable: true, render: (row) => <span className="font-semibold tabular-nums text-emerald-600">{formatCurrency(row.amount)}</span> },
    { key: "payment_mode", label: "Mode", sortable: true, render: (row) => <span className="text-xs text-neutral-600 uppercase">{row.payment_mode}</span> },
    { key: "status", label: "Status", sortable: true, render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Sales" description={loading ? "Loading sales..." : `Total value: ${formatCurrency(totalValue)} (${filtered.length} transactions)`} actions={
        <Link href="/agent/sales/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add New Sale
        </Link>
      } />

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
          <DataTable data={filtered} columns={columns} emptyMessage="No property sales match your search." />
          <div className="px-4 py-3 mt-4 bg-white border border-neutral-100 rounded-xl flex items-center justify-between text-xs text-neutral-500">
            <span>Showing {filtered.length} entries</span>
            {filtered.length > 0 && (
              <span className="font-medium text-neutral-700">
                Total value: <span className="text-emerald-600">{formatCurrency(totalValue)}</span>
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
