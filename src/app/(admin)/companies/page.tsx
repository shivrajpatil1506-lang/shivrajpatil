"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Building2, Edit, Trash2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { FilterBar, FilterConfig } from "@/components/shared/FilterBar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { getCompanies, deleteCompany } from "@/app/actions/companies";
import { useToast } from "@/components/ui/Toast";

type CompanyWithCounts = Awaited<ReturnType<typeof getCompanies>>[0];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const data = await getCompanies();
    setCompanies(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return companies.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || (c.short_name || "").toLowerCase().includes(q) || (c.cin || "").toLowerCase().includes(q);
      const matchStatus = !statusFilter || c.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, companies]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const res = await deleteCompany(deleteId);
    if (res.success) {
      success("Company Deleted", "The company has been deactivated.");
      setCompanies(companies.filter(c => c.id !== deleteId));
    } else {
      error("Delete Failed", res.error || "An error occurred.");
    }
    setIsDeleting(false);
    setDeleteId(null);
  };

  const hasFilters = !!(search || statusFilter);
  const clearFilters = () => { setSearch(""); setStatusFilter(""); };

  const filters: FilterConfig[] = [
    {
      key: "status", placeholder: "All Status", value: statusFilter, onChange: setStatusFilter,
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ]
    }
  ];

  const columns: ColumnDef<CompanyWithCounts>[] = [
    {
      key: "name", label: "Company", sortable: true,
      render: (row) => (
        <Link href={`/companies/${row.id}`} className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">{row.name}</div>
            <div className="text-xs text-neutral-500">{row.short_name} {row.cin && `• CIN: ${row.cin}`}</div>
          </div>
        </Link>
      )
    },
    { key: "phone_numbers", label: "Phone", sortable: false, render: (row) => <span className="tabular-nums">{row.phone_numbers || "—"}</span> },
    { key: "email", label: "Email", sortable: false, render: (row) => <span>{row.email || "—"}</span> },
    { key: "sites", label: "Sites", sortable: true, sortValue: (row) => row._count.sites, render: (row) => <span className="font-semibold">{row._count.sites}</span> },
    { key: "employees", label: "Employees", sortable: true, sortValue: (row) => row._count.employees, render: (row) => <span className="font-semibold">{row._count.employees}</span> },
    { key: "status", label: "Status", sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/companies/${row.id}/edit`} className="p-1.5 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title="Edit">
            <Edit className="w-4 h-4" />
          </Link>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Companies"
        description="Manage all subsidiary companies under GB Infra"
        actions={
          <Link href="/companies/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Company
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
        <DataTable data={filtered} columns={columns} emptyMessage="No companies match your search." />
      )}

      <ConfirmDialog 
        isOpen={!!deleteId}
        title="Delete Company"
        message="Are you sure you want to deactivate this company? It will no longer appear as active."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
