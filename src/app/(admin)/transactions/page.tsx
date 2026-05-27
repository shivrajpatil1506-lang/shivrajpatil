"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, DollarSign, TrendingDown, TrendingUp, Edit, Trash2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import KpiCard from "@/components/shared/KpiCard";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { FilterBar, FilterConfig } from "@/components/shared/FilterBar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getTransactions, deleteTransaction } from "@/app/actions/transactions";
import { getCompanies } from "@/app/actions/companies";
import { CATEGORY_LABELS, INCOME_CATEGORIES } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";

type TransactionData = Awaited<ReturnType<typeof getTransactions>>[0];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [statusFilter, setStatusFilter] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        || (txn.description || "").toLowerCase().includes(q)
        || (txn.customer_name || "").toLowerCase().includes(q)
        || (txn.vendor_name || "").toLowerCase().includes(q)
        || (txn.employee_name || "").toLowerCase().includes(q);
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

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const res = await deleteTransaction(deleteId);
    if (res.success) {
      success("Transaction Cancelled", "The transaction status has been updated to cancelled.");
      setTransactions(transactions.map(t => t.id === deleteId ? { ...t, status: "cancelled" } : t));
    } else {
      error("Delete Failed", res.error || "An error occurred.");
    }
    setIsDeleting(false);
    setDeleteId(null);
  };

  const totalIncome = filtered.filter(t => INCOME_CATEGORIES.includes(t.category as any) && t.status !== "cancelled").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => !INCOME_CATEGORIES.includes(t.category as any) && t.status !== "cancelled").reduce((s, t) => s + t.amount, 0);
  const net = totalIncome - totalExpense;

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
    { key: "transaction_code", label: "Txn ID", sortable: true, render: (row) => <Link href={`/transactions/${row.id}`} className="font-mono text-xs text-primary-600 hover:underline">{row.transaction_code}</Link> },
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
    { key: "status", label: "Status", sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/transactions/${row.id}/edit`} className="p-1.5 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title="Edit">
            <Edit className="w-4 h-4" />
          </Link>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Cancel/Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Transactions" description={`${filtered.length} transactions`} actions={
        <Link href="/transactions/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Transaction
        </Link>
      } />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard title="Income" value={formatCurrency(totalIncome)} icon={DollarSign} accentColor="#22C55E" />
        <KpiCard title="Expenses" value={formatCurrency(totalExpense)} icon={TrendingDown} accentColor="#EF4444" />
        <KpiCard title="Net" value={formatCurrency(net)} icon={TrendingUp} accentColor={net >= 0 ? "#2563EB" : "#EF4444"} />
      </div>

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
          <div className="px-4 py-3 mt-4 bg-white border border-neutral-100 rounded-xl text-xs text-neutral-500">
            Showing {filtered.length} of {transactions.length} transactions
          </div>
        </>
      )}

      <ConfirmDialog 
        isOpen={!!deleteId}
        title="Cancel Transaction"
        message="Are you sure you want to cancel this transaction? This action will mark it as cancelled."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
