"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FLAT_STATUS_CONFIG, FLAT_CATEGORY_CONFIG, Flat } from "./types";
import { User } from "lucide-react";

interface FlatTileProps {
  flat: Flat;
  onClick: (flat: Flat) => void;
}

export function FlatTile({ flat, onClick }: FlatTileProps) {
  const statusCfg = FLAT_STATUS_CONFIG[flat.status] ?? FLAT_STATUS_CONFIG.unsold;
  const catCfg    = FLAT_CATEGORY_CONFIG[flat.category] ?? FLAT_CATEGORY_CONFIG.new;
  const typeColor = flat.flat_type?.color_tag ?? "#94A3B8";
  const typeName  = flat.flat_type?.name ?? "?";

  return (
    <button
      onClick={() => onClick(flat)}
      title={`Flat ${flat.no} · ${typeName} · ${flat.status}${flat.customer ? ` · ${flat.customer.first_name} ${flat.customer.last_name}` : ""}`}
      className={cn(
        "relative flex flex-col items-start p-3 rounded-xl border transition-all duration-300 ease-out min-w-0",
        "hover:-translate-y-[2px] hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1",
        "w-full text-left cursor-pointer group bg-gradient-to-br from-white to-neutral-50/50",
        statusCfg.border,
        catCfg.border, // left-border = category indicator
      )}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <span className={cn("text-sm font-bold tracking-tight tabular-nums", statusCfg.text)} style={{ fontFamily: "var(--font-heading)" }}>
          {flat.no}
        </span>
        <span className={cn("w-2.5 h-2.5 rounded-full shadow-inner", statusCfg.dot)} />
      </div>

      <div className="flex items-center gap-1.5 mb-1.5">
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-black/5"
          style={{ backgroundColor: `${typeColor}15`, color: typeColor }}
        >
          {typeName}
        </span>
        <span className="text-[10px] font-medium text-neutral-400 tabular-nums">
          {Math.round(flat.sale_area)} sqft
        </span>
      </div>

      {flat.customer && flat.status !== "unsold" && (
        <div className="mt-1 w-full flex items-center gap-1 text-[10px] font-semibold text-primary-700 bg-primary-50/80 border border-primary-100/50 px-1.5 py-1 rounded-md truncate">
          <User className="w-3 h-3 shrink-0 opacity-70" />
          <span className="truncate">{flat.customer.first_name} {flat.customer.last_name}</span>
        </div>
      )}
    </button>
  );
}
