"use client";

import React, { useState, useMemo } from "react";
import { Plus, ChevronDown, ChevronRight, Pencil, Trash2, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { Block, Flat, FlatType, FlatMapFilters, FlatStatus, FLAT_STATUS_CONFIG } from "./types";
import { FloorRow } from "./FloorRow";

interface BlockCardProps {
  block: Block;
  flatTypes: FlatType[];
  filters: FlatMapFilters;
  onFlatClick: (flat: Flat) => void;
  onAddFlats: (floorId: string) => void;
  onAddFloor: (blockId: string) => void;
  onEditBlock: (block: Block) => void;
  onDeleteBlock: (block: Block) => void;
  onEditFloor: (floor: import("./types").Floor) => void;
  onDeleteFloor: (floor: import("./types").Floor) => void;
  onCopyFloor: (floor: import("./types").Floor) => void;
}

function fmtCr(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function BlockCard({
  block,
  flatTypes,
  filters,
  onFlatClick,
  onAddFlats,
  onAddFloor,
  onEditBlock,
  onDeleteBlock,
  onEditFloor,
  onDeleteFloor,
  onCopyFloor,
}: BlockCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const blockStats = useMemo(() => {
    const allFlats = block.floors.flatMap(f => f.flats);
    const byStatus: Record<FlatStatus, number> = { unsold: 0, booked: 0, hold: 0, sold: 0 };
    let totalSaleArea = 0;
    let totalValue = 0;

    for (const flat of allFlats) {
      byStatus[flat.status as FlatStatus] = (byStatus[flat.status as FlatStatus] || 0) + 1;
      const rate = flat.category === "redev" ? block.rate_redev : block.rate_new;
      totalSaleArea += flat.sale_area;
      totalValue += flat.sale_area * rate;
    }

    return { total: allFlats.length, byStatus, totalSaleArea, totalValue };
  }, [block]);

  const statuses: FlatStatus[] = ["unsold", "booked", "hold", "sold"];

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Block Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-100">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4 text-neutral-500" />
            : <ChevronDown className="w-4 h-4 text-neutral-500" />
          }
          <div>
            <h3 className="font-bold text-neutral-900 text-base">{block.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                block.default_category === "new"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-orange-100 text-orange-700"
              )}>
                {block.default_category === "new" ? "New" : "Redev"} default
              </span>
              <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                <IndianRupee className="w-2.5 h-2.5" />
                {block.rate_new.toLocaleString("en-IN")}/sqft new
              </span>
              {block.rate_redev > 0 && (
                <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                  · {block.rate_redev.toLocaleString("en-IN")}/sqft redev
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Stats pills */}
        <div className="hidden md:flex items-center gap-2">
          {statuses.map(s => blockStats.byStatus[s] > 0 && (
            <span key={s} className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", FLAT_STATUS_CONFIG[s].bg, FLAT_STATUS_CONFIG[s].text)}>
              {blockStats.byStatus[s]} {s}
            </span>
          ))}
        </div>

        {/* Value */}
        {blockStats.total > 0 && (
          <div className="text-right hidden lg:block">
            <p className="text-xs font-bold text-neutral-800">{fmtCr(blockStats.totalValue)}</p>
            <p className="text-[10px] text-neutral-400">portfolio value</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => onEditBlock(block)}
            title="Edit block"
            className="p-1.5 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteBlock(block)}
            title="Delete block"
            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Block Body */}
      {!collapsed && (
        <div className="p-4 bg-neutral-50/30">
          <div className="flex flex-col gap-4">
            {block.floors.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-neutral-200 rounded-xl bg-white">
                <p className="text-sm text-neutral-400 mb-3">No floors added yet.</p>
                <button
                  onClick={() => onAddFloor(block.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add First Floor
                </button>
              </div>
            )}

            {block.floors.map(floor => (
              <FloorRow
                key={floor.id}
                floor={floor}
                blockId={block.id}
                blockDefaultCategory={block.default_category}
                flatTypes={flatTypes}
                filters={filters}
                onFlatClick={onFlatClick}
                onAddFlats={onAddFlats}
                onEditFloor={onEditFloor}
                onDeleteFloor={onDeleteFloor}
                onCopyFloor={onCopyFloor}
              />
            ))}

            {/* Add Floor Button */}
            {block.floors.length > 0 && (
              <button
                onClick={() => onAddFloor(block.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-neutral-500 border border-dashed border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Floor
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
