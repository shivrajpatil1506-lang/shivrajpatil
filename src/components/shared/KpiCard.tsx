"use client";

import React from "react";
import { cn, getTrendColor, getTrendIcon } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string;
  trend?: number;
  icon: LucideIcon;
  accentColor: string;
};

export default function KpiCard({ title, value, trend, icon: Icon, accentColor }: KpiCardProps) {
  return (
    <div className="kpi-card group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>
            {value}
          </p>
          {trend !== undefined && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", getTrendColor(trend))}>
              <span>{getTrendIcon(trend)}</span>
              <span>{Math.abs(trend)}%</span>
              <span className="text-neutral-400 font-normal">vs last period</span>
            </div>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:bg-neutral-50"
          style={{ background: `${accentColor}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: accentColor }} />
        </div>
      </div>
    </div>
  );
}
