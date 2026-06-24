"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, ChevronUp, ChevronDown, Copy, Pencil, Trash2 } from "lucide-react";
import { FlatTile } from "./FlatTile";
import { Floor, Flat, FlatType, FlatMapFilters } from "./types";

interface FloorRowProps {
  floor: Floor;
  blockId: string;
  blockDefaultCategory: "new" | "redev";
  flatTypes: FlatType[];
  filters: FlatMapFilters;
  onFlatClick: (flat: Flat) => void;
  onAddFlats: (floorId: string) => void;
  onEditFloor: (floor: Floor) => void;
  onDeleteFloor: (floor: Floor) => void;
  onCopyFloor: (floor: Floor) => void;
}

function applyFilters(flats: Flat[], filters: FlatMapFilters): Flat[] {
  return flats.filter(f => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(f.status)) return false;
    if (filters.categories.length > 0 && !filters.categories.includes(f.category)) return false;
    if (filters.flatTypeIds.length > 0 && (!f.flat_type_id || !filters.flatTypeIds.includes(f.flat_type_id))) return false;
    if (filters.search && !f.no.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}

export function FloorRow({
  floor,
  blockId,
  blockDefaultCategory,
  flatTypes,
  filters,
  onFlatClick,
  onAddFlats,
  onEditFloor,
  onDeleteFloor,
  onCopyFloor,
}: FloorRowProps) {
  const [collapsed, setCollapsed] = useState(false);
  const visibleFlats = applyFilters(floor.flats, filters);

  const totalFlats = floor.flats.length;
  const soldCount = floor.flats.filter(f => f.status === "sold").length;
  const bookedCount = floor.flats.filter(f => f.status === "booked").length;
  const hasFilters = filters.statuses.length > 0 || filters.categories.length > 0 ||
    filters.flatTypeIds.length > 0 || !!filters.search;

  return (
    <div className={cn("border border-neutral-100 rounded-xl bg-white transition-all", collapsed && "opacity-80")}>
      {/* Floor Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-neutral-50 group">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-2 flex-1 text-left min-w-0"
        >
          <span className="font-semibold text-sm text-neutral-800 min-w-[80px]">{floor.label}</span>
          {collapsed ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />}
          <span className="text-[10px] text-neutral-400 ml-1">
            {totalFlats} flat{totalFlats !== 1 ? "s" : ""}
            {soldCount > 0 && ` · ${soldCount} sold`}
            {bookedCount > 0 && ` · ${bookedCount} booked`}
          </span>
        </button>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onCopyFloor(floor)}
            title="Copy floor to other floors"
            className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEditFloor(floor)}
            title="Edit floor label"
            className="p-1.5 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteFloor(floor)}
            title="Delete floor"
            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add flats button */}
        <button
          onClick={() => onAddFlats(floor.id)}
          className="flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-lg hover:bg-primary-100 transition-colors border border-primary-200"
        >
          <Plus className="w-3 h-3" />
          Add flats
        </button>
      </div>

      {/* Flat Tiles Grid */}
      {!collapsed && (
        <div className="p-3">
          {floor.flats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-xs text-neutral-400 mb-2">No flats on this floor yet.</p>
              <button
                onClick={() => onAddFlats(floor.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add flats
              </button>
            </div>
          ) : (
            <>
              {hasFilters && visibleFlats.length === 0 ? (
                <p className="text-xs text-neutral-400 py-3 text-center">No flats match current filters.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {visibleFlats.map(flat => (
                    <FlatTile key={flat.id} flat={flat} onClick={onFlatClick} />
                  ))}
                </div>
              )}
              {hasFilters && visibleFlats.length > 0 && visibleFlats.length !== totalFlats && (
                <p className="text-[10px] text-neutral-400 mt-2">
                  Showing {visibleFlats.length} of {totalFlats} flats (filtered)
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
