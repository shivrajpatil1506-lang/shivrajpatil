"use client";

import React, { useState } from "react";
import { Settings2, Download, Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlatType, FlatStatus, FlatCategory, FlatMapFilters, DEFAULT_FILTERS } from "./types";
import { FlatStatusLegend } from "./FlatStatusLegend";
import { exportFlatMapCSV } from "@/app/actions/flat-map";

interface FlatMapToolbarProps {
  siteId: string;
  flatTypes: FlatType[];
  filters: FlatMapFilters;
  onFiltersChange: (f: FlatMapFilters) => void;
  onManageFlatTypes: () => void;
}

const STATUSES: FlatStatus[] = ["unsold", "booked", "hold", "sold"];
const CATEGORIES: FlatCategory[] = ["new", "redev"];

function toggleArr<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

export function FlatMapToolbar({
  siteId,
  flatTypes,
  filters,
  onFiltersChange,
  onManageFlatTypes,
}: FlatMapToolbarProps) {
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.categories.length > 0 ||
    filters.flatTypeIds.length > 0 ||
    !!filters.search;

  const handleExport = async () => {
    setExporting(true);
    const res = await exportFlatMapCSV(siteId);
    setExporting(false);
    if (res.success && res.csv) {
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flat-inventory-${siteId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearFilters = () => onFiltersChange(DEFAULT_FILTERS);

  return (
    <div className="space-y-3 mb-4">
      {/* Top row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search flat no…"
            value={filters.search}
            onChange={e => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-3 h-[38px] text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
          />
          {filters.search && (
            <button onClick={() => onFiltersChange({ ...filters, search: "" })} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className={cn(
            "flex items-center gap-2 px-3 h-[38px] text-sm border rounded-lg transition-colors",
            showFilters || hasActiveFilters
              ? "bg-primary-50 border-primary-300 text-primary-700"
              : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary-500 ml-0.5" />
          )}
        </button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-neutral-500 hover:text-neutral-700 px-2 py-2"
          >
            Clear all
          </button>
        )}
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Manage flat types */}
          <button
            onClick={onManageFlatTypes}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 h-[38px] text-sm font-medium border border-neutral-200 rounded-lg bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-sm"
          >
          <Settings2 className="w-3.5 h-3.5" />
          Flat Types
        </button>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 h-[38px] text-sm font-medium border border-neutral-200 rounded-lg bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
          {/* Status filter */}
          <div>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => onFiltersChange({ ...filters, statuses: toggleArr(filters.statuses, s) })}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-full border transition-all capitalize",
                    filters.statuses.includes(s)
                      ? "bg-primary-500 text-white border-primary-500"
                      : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Category</p>
            <div className="flex gap-1.5">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => onFiltersChange({ ...filters, categories: toggleArr(filters.categories, c) })}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-full border transition-all",
                    filters.categories.includes(c)
                      ? "bg-primary-500 text-white border-primary-500"
                      : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                  )}
                >
                  {c === "new" ? "New" : "Redev"}
                </button>
              ))}
            </div>
          </div>

          {/* Flat type filter */}
          {flatTypes.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Flat Type</p>
              <div className="flex flex-wrap gap-1.5">
                {flatTypes.map(ft => (
                  <button
                    key={ft.id}
                    onClick={() => onFiltersChange({ ...filters, flatTypeIds: toggleArr(filters.flatTypeIds, ft.id) })}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-full border transition-all",
                      filters.flatTypeIds.includes(ft.id)
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                    )}
                  >
                    {ft.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
