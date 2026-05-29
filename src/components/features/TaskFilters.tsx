"use client";

import React from "react";
import { Search, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TaskFilters({
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  assigneeFilter,
  setAssigneeFilter,
  employees,
  isAdminOrHR,
  viewMode,
  setViewMode,
  taskCount,
  overdueCount,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (a: string) => void;
  employees: any[];
  isAdminOrHR: boolean;
  viewMode: "kanban" | "list";
  setViewMode: (v: "kanban" | "list") => void;
  taskCount: number;
  overdueCount: number;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 flex-wrap">
      {/* Search Input */}
      <div className="relative max-w-xs flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search tasks…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="All">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Assignee Filter (Only for Admin/HR) */}
        {isAdminOrHR && (
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="All">All Assignees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex items-center bg-neutral-100 p-1 rounded-lg">
        <button
          onClick={() => setViewMode("kanban")}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            viewMode === "kanban" ? "bg-white shadow-sm text-primary-600" : "text-neutral-500 hover:text-neutral-700"
          )}
          title="Kanban View"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            viewMode === "list" ? "bg-white shadow-sm text-primary-600" : "text-neutral-500 hover:text-neutral-700"
          )}
          title="List View"
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* Task count summary */}
      <div className="ml-auto flex items-center gap-1.5 text-xs text-neutral-500">
        <span className="font-medium text-neutral-800">{taskCount}</span> total tasks
        {overdueCount > 0 && (
          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-200 font-medium">
            {overdueCount} overdue
          </span>
        )}
      </div>
    </div>
  );
}
