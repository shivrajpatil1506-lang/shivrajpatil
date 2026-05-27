"use client";

import React from "react";
import { Search, X } from "lucide-react";

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterConfig = {
  key: string;
  placeholder: string;
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
};

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filters?: FilterConfig[];
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function FilterBar({ searchQuery, onSearchChange, filters = [], onClearFilters, hasActiveFilters }: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="flex flex-1 flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
          </div>
          
          {filters.map(filter => (
            <select
              key={filter.key}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none cursor-pointer"
            >
              <option value="">{filter.placeholder}</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
        </div>

        {hasActiveFilters && onClearFilters && (
          <button 
            onClick={onClearFilters}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <X className="w-4 h-4" /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
