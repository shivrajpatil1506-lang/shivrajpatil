"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, MapPin, Edit, Trash2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { FilterBar, FilterConfig } from "@/components/shared/FilterBar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { getSites, deleteSite } from "@/app/actions/sites";
import { getCompanies } from "@/app/actions/companies";
import { useToast } from "@/components/ui/Toast";

type SiteData = Awaited<ReturnType<typeof getSites>>[0];
type CompanyData = Awaited<ReturnType<typeof getCompanies>>[0];

export default function SitesPage() {
  const [sites, setSites] = useState<SiteData[]>([]);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [sitesData, compData] = await Promise.all([getSites(), getCompanies()]);
    setSites(sitesData);
    setCompanies(compData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return sites.filter(site => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || site.name.toLowerCase().includes(q)
        || site.site_code.toLowerCase().includes(q)
        || (site.city || "").toLowerCase().includes(q)
        || (site.rera_number || "").toLowerCase().includes(q);
      const matchCompany = !companyFilter || site.company_id === companyFilter;
      const matchType = !typeFilter || site.site_type === typeFilter;
      const matchStatus = !statusFilter || site.status === statusFilter;
      return matchSearch && matchCompany && matchType && matchStatus;
    });
  }, [search, companyFilter, typeFilter, statusFilter, sites]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const res = await deleteSite(deleteId);
    if (res.success) {
      success("Site On Hold", "The site status has been updated to on_hold.");
      setSites(sites.map(s => s.id === deleteId ? { ...s, status: "on_hold" } : s));
    } else {
      error("Delete Failed", res.error || "An error occurred.");
    }
    setIsDeleting(false);
    setDeleteId(null);
  };

  const hasFilters = !!(search || companyFilter || typeFilter || statusFilter);
  const clearFilters = () => { setSearch(""); setCompanyFilter(""); setTypeFilter(""); setStatusFilter(""); };

  const totalUnits = filtered.reduce((s, site) => s + (site._count?.units || 0), 0);
  const soldUnits = filtered.reduce((s, site) => s + (site.units?.filter(u => u.status === 'sold').length || 0), 0);

  const filters: FilterConfig[] = [
    {
      key: "company", placeholder: "All Companies", value: companyFilter, onChange: setCompanyFilter,
      options: companies.map(c => ({ label: c.short_name || c.name, value: c.id }))
    },
    {
      key: "type", placeholder: "All Types", value: typeFilter, onChange: setTypeFilter,
      options: [
        { label: "Residential", value: "residential" },
        { label: "Commercial", value: "commercial" },
        { label: "Mixed", value: "mixed" },
      ]
    },
    {
      key: "status", placeholder: "All Status", value: statusFilter, onChange: setStatusFilter,
      options: [
        { label: "Active", value: "active" },
        { label: "Completed", value: "completed" },
        { label: "On Hold", value: "on_hold" },
      ]
    }
  ];

  const columns: ColumnDef<SiteData>[] = [
    {
      key: "name", label: "Site Name", sortable: true,
      render: (row) => (
        <div>
          <Link href={`/sites/${row.id}`} className="font-medium text-neutral-900 hover:text-primary-600 transition-colors flex items-center gap-2">
            <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />{row.name}
          </Link>
          <p className="text-[10px] text-neutral-400 font-mono ml-6">{row.site_code}</p>
        </div>
      )
    },
    { key: "company", label: "Company", sortable: true, sortValue: (row) => row.company?.short_name || row.company?.name || "", render: (row) => <span className="text-neutral-600 text-xs">{row.company?.short_name || row.company?.name || "Unknown"}</span> },
    { key: "city", label: "City", sortable: true },
    { key: "site_type", label: "Type", sortable: true, render: (row) => <StatusBadge status={row.site_type} /> },
    { key: "property_types", label: "Property Types", sortable: false, render: (row) => {
        const propTypes = row.property_types ? row.property_types.split(',') : [];
        return (
          <div className="flex flex-wrap gap-1">
            {propTypes.map(pt => <span key={pt} className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">{pt.trim()}</span>)}
          </div>
        );
      } 
    },
    { key: "total_units", label: "Total", sortable: true, sortValue: (row) => row._count?.units || 0, render: (row) => <span className="font-semibold text-neutral-900 tabular-nums">{row._count?.units || 0}</span> },
    { key: "sold_units", label: "Sold", sortable: true, sortValue: (row) => row.units?.filter(u => u.status === 'sold').length || 0, render: (row) => <span className="text-emerald-600 font-semibold tabular-nums">{row.units?.filter(u => u.status === 'sold').length || 0}</span> },
    { key: "available_units", label: "Available", sortable: true, sortValue: (row) => (row._count?.units || 0) - (row.units?.filter(u => u.status === 'sold').length || 0), render: (row) => <span className="text-blue-600 font-semibold tabular-nums">{(row._count?.units || 0) - (row.units?.filter(u => u.status === 'sold').length || 0)}</span> },
    { key: "status", label: "Status", sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/sites/${row.id}/edit`} className="p-1.5 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title="Edit">
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
        title="Sites"
        description={`${filtered.length} sites · ${soldUnits}/${totalUnits} units sold`}
        actions={
          <Link href="/sites/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Site
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
        <DataTable data={filtered} columns={columns} emptyMessage="No sites match your search." />
      )}

      <ConfirmDialog 
        isOpen={!!deleteId}
        title="Put Site On Hold"
        message="Are you sure you want to remove this site from active view? This will mark it as on hold."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
