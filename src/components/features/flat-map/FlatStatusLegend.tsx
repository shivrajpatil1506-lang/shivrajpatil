"use client";

import React from "react";
import { FLAT_STATUS_CONFIG, FlatStatus } from "./types";

export function FlatStatusLegend() {
  const statuses = Object.entries(FLAT_STATUS_CONFIG) as [FlatStatus, (typeof FLAT_STATUS_CONFIG)[FlatStatus]][];
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {statuses.map(([status, cfg]) => (
        <div key={status} className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-sm inline-block ${cfg.dot}`} />
          <span className="text-xs text-neutral-500">{cfg.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-neutral-200">
        <span className="w-3 h-3 rounded-sm inline-block border-l-4 border-indigo-500 bg-slate-50" />
        <span className="text-xs text-neutral-500">New</span>
        <span className="w-3 h-3 rounded-sm inline-block border-l-4 border-orange-400 bg-slate-50 ml-1" />
        <span className="text-xs text-neutral-500">Redev</span>
      </div>
    </div>
  );
}
