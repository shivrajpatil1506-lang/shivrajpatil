"use client";

import React from "react";
import { Task } from "@/lib/types";
import { formatDate, getInitials, cn } from "@/lib/utils";
import { TASK_STATUS_LABELS } from "@/lib/constants";
import { Clock, Calendar, CheckCircle2, CircleDashed, AlertCircle, RotateCw } from "lucide-react";

const PRIORITY_STYLES = {
  high: "bg-red-50 text-red-600 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_STYLES: Record<string, string> = {
  todo: "bg-neutral-100 text-neutral-700 border-neutral-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  review: "bg-purple-50 text-purple-700 border-purple-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function TaskListView({
  tasks,
  employees,
  currentUserId,
  onTaskClick,
}: {
  tasks: Task[];
  employees: any[];
  currentUserId: string;
  onTaskClick: (task: Task) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-neutral-200">
        <CircleDashed className="w-12 h-12 text-neutral-300 mb-4" />
        <p className="text-neutral-500 font-medium">No tasks found</p>
        <p className="text-sm text-neutral-400 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 font-medium">Task Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Assignee</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {tasks.map((task) => {
              const assignee = employees.find((e) => e.id === task.assigned_to);
              const assignedName = assignee
                ? `${assignee.first_name} ${assignee.last_name}`
                : task.assigned_to === currentUserId
                ? "Me"
                : "Unassigned";

              const isOverdue =
                task.due_date &&
                task.status !== "done" &&
                new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0));

              const checklistDone = task.checklist_done ?? 0;
              const checklistTotal = task.checklist_total ?? 0;
              const progress = checklistTotal > 0 ? (checklistDone / checklistTotal) * 100 : 0;

              return (
                <tr
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="hover:bg-neutral-50 cursor-pointer transition-colors group"
                >
                  {/* Task Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[200px] max-w-[300px]">
                      {task.status === "done" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <CircleDashed className="w-4 h-4 text-neutral-400 shrink-0 group-hover:text-primary-500 transition-colors" />
                      )}
                      <div className="truncate font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">
                        {task.title}
                      </div>
                      {task.is_recurring && <RotateCw className="w-3.5 h-3.5 text-neutral-400 shrink-0" />}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full border",
                        STATUS_STYLES[task.status]
                      )}
                    >
                      {TASK_STATUS_LABELS[task.status]}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full border",
                        PRIORITY_STYLES[task.priority as keyof typeof PRIORITY_STYLES]
                      )}
                    >
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </td>

                  {/* Assignee */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[9px] font-bold">
                        {getInitials(assignedName)}
                      </div>
                      <span className="text-neutral-700">{assignedName}</span>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="px-4 py-3">
                    {task.due_date ? (
                      <div
                        className={cn(
                          "flex items-center gap-1.5",
                          isOverdue ? "text-red-600 font-medium" : "text-neutral-600"
                        )}
                      >
                        {isOverdue ? <AlertCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4 text-neutral-400" />}
                        {formatDate(task.due_date)}
                      </div>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>

                  {/* Progress */}
                  <td className="px-4 py-3">
                    {checklistTotal > 0 ? (
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              progress === 100 ? "bg-emerald-500" : "bg-primary-500"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-500 w-8">{Math.round(progress)}%</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
