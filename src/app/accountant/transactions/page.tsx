"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { FilterBar, FilterConfig } from "@/components/shared/FilterBar";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getTransactions } from "@/app/actions/transactions";
import { getCompanies } from "@/app/actions/companies";
import { CATEGORY_LABELS, INCOME_CATEGORIES } from "@/lib/constants";

type TransactionData = Awaited<ReturnType<typeof getTransactions>>[0];

export default function AccountantTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [txns, comps] = await Promise.all([getTransactions(), getCompanies()]);
    setTransactions(txns);
    setCompanies(comps);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    return transactions.filter(txn => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || txn.transaction_code.toLowerCase().includes(q)
        || (txn.description || "").toLowerCase().includes(q);
      const matchCompany = !companyFilter || txn.company_id === companyFilter;
      const matchCategory = !categoryFilter || txn.category === categoryFilter;
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

      return matchSearch && matchCompany && matchCategory && matchDate && matchStatus;
    });
  }, [search, companyFilter, categoryFilter, dateFilter, statusFilter, transactions]);

  const hasFilters = !!(search || companyFilter || categoryFilter || dateFilter !== "All Time" || statusFilter);
  const clearFilters = () => { setSearch(""); setCompanyFilter(""); setCategoryFilter(""); setDateFilter("All Time"); setStatusFilter(""); };

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
      key: "company", placeholder: "All Companies", value: companyFilter, onChange: setCompanyFilter,
      options: companies.map(c => ({ label: c.short_name || c.name, value: c.id }))
    },
    {
      key: "category", placeholder: "All Categories", value: categoryFilter, onChange: setCategoryFilter,
      options: Object.entries(CATEGORY_LABELS).map(([k, v]) => ({ label: v, value: k }))
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
    { key: "transaction_code", label: "Txn ID", sortable: true, render: (row) => <span className="font-mono text-xs">{row.transaction_code}</span> },
    { key: "transaction_date", label: "Date", sortable: true, sortValue: (row) => new Date(row.transaction_date).getTime(), render: (row) => <span className="tabular-nums text-xs">{formatDate(row.transaction_date)}</span> },
    { key: "company_name", label: "Company", sortable: true, render: (row) => <span className="text-xs">{row.company_name}</span> },
    { key: "category", label: "Category", sortable: true, render: (row) => {
        const isIncome = INCOME_CATEGORIES.includes(row.category as any);
        return (
          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", isIncome ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
            {CATEGORY_LABELS[row.category as keyof typeof CATEGORY_LABELS] || row.category}
          </span>
        );
      } 
    },
    { key: "description", label: "Description", sortable: false, render: (row) => <span className="max-w-[150px] truncate block text-xs">{row.description}</span> },
    { key: "amount", label: "Amount", sortable: true, render: (row) => {
        const isIncome = INCOME_CATEGORIES.includes(row.category as any);
        return (
          <span className={cn("font-semibold tabular-nums", isIncome ? "text-emerald-600" : "text-red-600")}>
            {isIncome ? "+" : "−"}{formatCurrency(row.amount)}
          </span>
        );
      } 
    },
    { key: "payment_mode", label: "Mode", sortable: true, render: (row) => <span className="text-xs text-neutral-600 uppercase">{row.payment_mode}</span> },
    { key: "status", label: "Status", sortable: true, render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Transactions" description={`Viewing ${filtered.length} transactions`} actions={
        <Link href="/accountant/transactions/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Transaction
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
          <DataTable data={filtered} columns={columns} emptyMessage="No transactions match your search." />
          <div className="px-4 py-3 mt-4 bg-white border border-neutral-100 rounded-xl flex items-center justify-between text-xs text-neutral-500">
            <span>Showing {filtered.length} entries</span>
          </div>
        </>
      )}
    </div>
  );
}
