"use client";

import React from "react";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  done: "bg-blue-50 text-blue-700 border-blue-200",
  inactive: "bg-neutral-100 text-neutral-600 border-neutral-200",
  cancelled: "bg-neutral-100 text-neutral-600 border-neutral-200",
  deleted: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  pending_edit: "bg-amber-50 text-amber-700 border-amber-200",
  pending_delete: "bg-orange-50 text-orange-700 border-orange-200",
  partially_paid: "bg-amber-50 text-amber-700 border-amber-200",
  awaiting_info: "bg-amber-50 text-amber-700 border-amber-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  on_hold: "bg-orange-50 text-orange-700 border-orange-200",
  review: "bg-purple-50 text-purple-700 border-purple-200",
  todo: "bg-neutral-100 text-neutral-600 border-neutral-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  booked: "bg-blue-50 text-blue-700 border-blue-200",
  sold: "bg-purple-50 text-purple-700 border-purple-200",
  hold: "bg-amber-50 text-amber-700 border-amber-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
  edit: "bg-amber-50 text-amber-700 border-amber-200",
  delete: "bg-red-50 text-red-700 border-red-200",
  defaulted: "bg-red-50 text-red-700 border-red-200",
  residential: "bg-blue-50 text-blue-700 border-blue-200",
  commercial: "bg-purple-50 text-purple-700 border-purple-200",
  mixed: "bg-teal-50 text-teal-700 border-teal-200",
};

const statusLabels: Record<string, string> = {
  active: "Active", inactive: "Inactive", pending: "Pending",
  pending_edit: "Pending Edit", pending_delete: "Pending Delete",
  approved: "Approved", rejected: "Rejected", completed: "Completed",
  overdue: "Overdue", on_hold: "On Hold", cancelled: "Cancelled",
  paid: "Paid", partially_paid: "Partial", todo: "To Do",
  in_progress: "In Progress", review: "Review", done: "Done",
  high: "High", medium: "Medium", low: "Low",
  available: "Available", booked: "Booked", sold: "Sold", hold: "Hold",
  deleted: "Deleted", awaiting_info: "Awaiting Info",
  suspended: "Suspended", edit: "Edit", delete: "Delete",
  defaulted: "Defaulted", residential: "Residential",
  commercial: "Commercial", mixed: "Mixed",
};

type StatusBadgeProps = {
  status: string;
  size?: "sm" | "md";
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/ /g, "_");
  const style = statusStyles[key] || "bg-neutral-100 text-neutral-600 border-neutral-200";
  const label = statusLabels[key] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border whitespace-nowrap",
        style,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      )}
    >
      {label}
    </span>
  );
}
