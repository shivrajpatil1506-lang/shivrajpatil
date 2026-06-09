"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { FilterBar, FilterConfig } from "@/components/shared/FilterBar";
import { formatCurrency, formatDate } from "@/lib/utils";

type TransactionData = any;

export function SalaryClient({ initialTransactions }: { initialTransactions: any[] }) {
  const [transactions] = useState<TransactionData[]>(initialTransactions);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter(txn => {
      if (txn.category !== "SALARY") return false;

      const q = search.toLowerCase();
      const matchSearch = !q
        || txn.transaction_code.toLowerCase().includes(q)
        || (txn.employee_name || "").toLowerCase().includes(q)
        || (txn.company_name || "").toLowerCase().includes(q);
      const matchStatus = !statusFilter || txn.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, transactions]);

  const hasFilters = !!(search || statusFilter);
  const clearFilters = () => { setSearch(""); setStatusFilter(""); };

  const filters: FilterConfig[] = [
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
    { key: "employee_name", label: "Employee", sortable: true, render: (row) => <span className="font-medium text-neutral-900">{row.employee_name || "—"}</span> },
    { key: "company_name", label: "Company", sortable: true, render: (row) => <span className="text-xs text-neutral-600">{row.company_name}</span> },
    { key: "amount", label: "Amount", sortable: true, render: (row) => <span className="font-semibold text-red-600 tabular-nums">−{formatCurrency(row.amount)}</span> },
    { key: "payment_mode", label: "Mode", sortable: true, render: (row) => <span className="text-xs text-neutral-600 uppercase">{row.payment_mode}</span> },
    { key: "status", label: "Status", sortable: true, render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Salary Processing" description={`Viewing ${filtered.length} salary records`} />

      <FilterBar 
        searchQuery={search} 
        onSearchChange={setSearch} 
        filters={filters} 
        hasActiveFilters={hasFilters} 
        onClearFilters={clearFilters} 
      />

      <DataTable data={filtered} columns={columns} emptyMessage="No salary records found." />
    </div>
  );
}
