"use client";

import React, { useMemo } from "react";
import { Block, FlatStatus, FlatCategory, FlatType } from "./types";
import { IndianRupee, Home, Maximize, Key, BadgePercent } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  blocks: Block[];
  flatTypes: FlatType[];
}

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function fmtCr(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return `₹${fmt(n)}`;
}

const STATUS_CONFIG: Record<FlatStatus, { bg: string; text: string; label: string; iconBg: string }> = {
  unsold: { bg: "bg-white", text: "text-neutral-700", label: "Unsold", iconBg: "bg-neutral-100" },
  booked: { bg: "bg-amber-50/50", text: "text-amber-700", label: "Booked", iconBg: "bg-amber-100" },
  hold:   { bg: "bg-violet-50/50", text: "text-violet-700", label: "Hold", iconBg: "bg-violet-100" },
  sold:   { bg: "bg-emerald-50/50", text: "text-emerald-700", label: "Sold", iconBg: "bg-emerald-100" },
};

export function ProjectSummaryBar({ blocks, flatTypes }: Props) {
  const stats = useMemo(() => {
    const allFlats = blocks.flatMap(b => b.floors.flatMap(f => f.flats));
    const total = allFlats.length;

    const byStatus: Record<FlatStatus, number> = { unsold: 0, booked: 0, hold: 0, sold: 0 };
    const byCategory: Record<FlatCategory, { count: number; carpetArea: number; saleArea: number; value: number }> = {
      new:   { count: 0, carpetArea: 0, saleArea: 0, value: 0 },
      redev: { count: 0, carpetArea: 0, saleArea: 0, value: 0 },
    };
    let totalCarpet = 0;
    let totalSale = 0;
    let totalValue = 0;
    let totalBookedValue = 0;

    for (const block of blocks) {
      const rateNew = block.rate_new;
      const rateRedev = block.rate_redev;
      for (const floor of block.floors) {
        for (const flat of floor.flats) {
          const status = flat.status as FlatStatus;
          byStatus[status] = (byStatus[status] || 0) + 1;
          const cat = flat.category as FlatCategory;
          const rate = cat === "redev" ? rateRedev : rateNew;
          const val = flat.sale_area * rate;
          
          byCategory[cat].count++;
          byCategory[cat].carpetArea += flat.carpet_area;
          byCategory[cat].saleArea += flat.sale_area;
          byCategory[cat].value += val;
          
          totalCarpet += flat.carpet_area;
          totalSale += flat.sale_area;
          totalValue += val;
          if (status === "sold" || status === "booked") {
            totalBookedValue += val;
          }
        }
      }
    }

    return { total, byStatus, byCategory, totalCarpet, totalSale, totalValue, totalBookedValue };
  }, [blocks]);

  const statuses: FlatStatus[] = ["sold", "booked", "hold", "unsold"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in-up">
      {/* Total Inventory */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between group hover:border-primary-100 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Total Inventory</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>{stats.total}</span>
              <span className="text-sm font-medium text-neutral-500">flats</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Home className="w-5 h-5" />
          </div>
        </div>
        <div className="h-12 flex items-center gap-2 pt-3 border-t border-neutral-50 mt-auto">
          {statuses.map(s => {
            const count = stats.byStatus[s];
            if (count === 0) return null;
            return (
              <span key={s} className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", STATUS_CONFIG[s].bg, STATUS_CONFIG[s].text, `border-${STATUS_CONFIG[s].text.split('-')[1]}-100`)}>
                {count} {STATUS_CONFIG[s].label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Project Value */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between group hover:border-emerald-100 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Total Value</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>{fmtCr(stats.totalValue)}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
        <div className="h-12 flex items-center pt-3 border-t border-neutral-50 mt-auto">
          <p className="text-xs font-medium text-neutral-500">
            <span className="text-emerald-600 font-bold">{fmtCr(stats.totalBookedValue)}</span> booked/sold
          </p>
        </div>
      </div>

      {/* Total Area */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between group hover:border-blue-100 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Total Area</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>{fmt(stats.totalSale)}</span>
              <span className="text-xs font-medium text-neutral-500">sqft sale</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Maximize className="w-5 h-5" />
          </div>
        </div>
        <div className="h-12 flex items-center justify-between pt-3 border-t border-neutral-50 mt-auto">
          <p className="text-xs font-medium text-neutral-500">
            {fmt(stats.totalCarpet)} sqft carpet
          </p>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            ~{stats.totalSale > 0 ? Math.round(((stats.totalSale - stats.totalCarpet) / stats.totalCarpet) * 100) : 0}% loading
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between group hover:border-amber-100 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="w-full">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Inventory Split</p>
            <div className="space-y-2.5">
              {(["new", "redev"] as FlatCategory[]).map(cat => (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-4 rounded-full", cat === "new" ? "bg-indigo-500" : "bg-orange-400")} />
                    <span className="text-sm font-medium text-neutral-700">{cat === "new" ? "New Flats" : "Redev Flats"}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-neutral-900">{stats.byCategory[cat].count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="h-12 flex items-center pt-3 border-t border-neutral-50 mt-auto">
          <p className="text-xs font-medium text-neutral-400">
            {flatTypes.length} distinct flat configurations
          </p>
        </div>
      </div>
    </div>
  );
}
