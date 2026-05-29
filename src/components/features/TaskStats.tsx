"use client";

import React from "react";
import { Task } from "@/lib/types";
import { CheckCircle2, Clock, AlertCircle, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TaskStats({ tasks }: { tasks: Task[] }) {
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    inProgress: tasks.filter(t => t.status === "in_progress" || t.status === "review").length,
    done: tasks.filter(t => t.status === "done").length,
    overdue: tasks.filter(t => {
      if (!t.due_date || t.status === "done") return false;
      return new Date(t.due_date) < new Date(new Date().setHours(0,0,0,0));
    }).length,
  };

  const donePercent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total Tasks" 
        value={stats.total} 
        icon={<CircleDashed className="w-5 h-5 text-blue-500" />} 
        className="border-l-4 border-l-blue-500"
      />
      <StatCard 
        title="In Progress" 
        value={stats.inProgress} 
        icon={<Clock className="w-5 h-5 text-amber-500" />} 
        className="border-l-4 border-l-amber-500"
      />
      <StatCard 
        title="Completed" 
        value={stats.done} 
        subtitle={`${donePercent}%`}
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} 
        className="border-l-4 border-l-emerald-500"
      />
      <StatCard 
        title="Overdue" 
        value={stats.overdue} 
        icon={<AlertCircle className="w-5 h-5 text-red-500" />} 
        className="border-l-4 border-l-red-500"
        valueClassName={stats.overdue > 0 ? "text-red-600" : ""}
      />
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subtitle,
  icon, 
  className,
  valueClassName
}: { 
  title: string; 
  value: number | string; 
  subtitle?: string;
  icon: React.ReactNode; 
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("bg-white p-4 rounded-xl border border-neutral-100 shadow-sm flex items-center justify-between", className)}>
      <div>
        <p className="text-xs font-medium text-neutral-500 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className={cn("text-2xl font-bold text-neutral-900", valueClassName)}>{value}</p>
          {subtitle && <p className="text-sm font-medium text-emerald-600">{subtitle}</p>}
        </div>
      </div>
      <div className="p-2 bg-neutral-50 rounded-lg">
        {icon}
      </div>
    </div>
  );
}
