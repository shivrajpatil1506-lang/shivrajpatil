"use client";

import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export type ColumnDef<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number | null | undefined;
};

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  emptyMessage?: string;
}

export function DataTable<T>({ data, columns, emptyMessage = "No records found" }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    
    return [...data].sort((a, b) => {
      const col = columns.find(c => c.key === sortKey);
      if (!col) return 0;
      
      let valA = col.sortValue ? col.sortValue(a) : (a as any)[sortKey];
      let valB = col.sortValue ? col.sortValue(b) : (b as any)[sortKey];
      
      if (valA == null) valA = "";
      if (valB == null) valB = "";
      
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, columns, sortKey, sortOrder]);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50/80 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {columns.map((col) => (
                <th 
                  key={col.key.toString()} 
                  className={`px-6 py-4 ${col.sortable ? 'cursor-pointer hover:bg-neutral-100 transition-colors select-none' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key.toString())}
                >
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    {col.label}
                    {col.sortable && sortKey === col.key.toString() && (
                      <span className="text-neutral-700">
                        {sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sortedData.length > 0 ? (
              sortedData.map((row, i) => (
                <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key.toString()} className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      {col.render ? col.render(row) : (row as any)[col.key as keyof T]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-neutral-500 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
