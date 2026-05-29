"use client";

import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { Task } from "@/lib/types";
import { X, Calendar, Clock, Tag, AlignLeft, RotateCw, AlertCircle } from "lucide-react";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { TASK_STATUS_LABELS } from "@/lib/constants";
import TaskChecklist from "./TaskChecklist";
import TaskComments from "./TaskComments";
import TaskActivityLog from "./TaskActivityLog";
import { updateTaskStatus } from "@/app/actions/tasks";
import { useToast } from "@/components/ui/Toast";

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

export default function TaskDetailPanel({
  task,
  isOpen,
  onClose,
  employees,
  currentUserId,
  isAdminOrHR,
  onTaskChange,
}: {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  employees: any[];
  currentUserId: string;
  isAdminOrHR: boolean;
  onTaskChange: () => void;
}) {
  const [activeTab, setActiveTab] = useState("checklist");
  const { success, error } = useToast();

  // Reset tab when task changes
  useEffect(() => {
    if (isOpen) setActiveTab("checklist");
  }, [isOpen, task?.id]);

  if (!task) return null;

  const assignee = employees.find((e) => e.id === task.assigned_to);
  const assigner = employees.find((e) => e.id === task.assigned_by);
  const assignedName = assignee ? `${assignee.first_name} ${assignee.last_name}` : task.assigned_to === currentUserId ? "Me" : "Unknown";
  const assignerName = assigner ? `${assigner.first_name} ${assigner.last_name}` : task.assigned_by === "system" ? "System" : "Unknown";
  
  const canEdit = isAdminOrHR || task.assigned_to === currentUserId;

  const isOverdue = task.due_date && task.status !== "done" && new Date(task.due_date) < new Date(new Date().setHours(0,0,0,0));

  const handleStatusChange = async (newStatus: string) => {
    if (!canEdit) return;
    const res = await updateTaskStatus(task.id, newStatus);
    if (res.success) {
      success("Status updated");
      onTaskChange();
    } else {
      error("Failed to update status", res.error);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 sm:border-l border-neutral-200 focus:outline-none">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-400 bg-neutral-100 px-2 py-1 rounded">
                #{task.id.slice(-5).toUpperCase()}
              </span>
              {isOverdue && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-1 rounded border border-red-200">
                  <AlertCircle className="w-3 h-3" /> Overdue
                </span>
              )}
            </div>
            <Dialog.Close className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              
              {/* Title & Description */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 leading-tight mb-3">
                  {task.title}
                </h2>
                
                {task.description && (
                  <div className="flex gap-3 text-sm text-neutral-600 bg-neutral-50 p-4 rounded-xl border border-neutral-100 whitespace-pre-wrap">
                    <AlignLeft className="w-5 h-5 shrink-0 text-neutral-400" />
                    <p className="leading-relaxed">{task.description}</p>
                  </div>
                )}
              </div>

              {/* Badges / Meta */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Dropdown */}
                <select 
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={!canEdit}
                  className={cn(
                    "text-xs font-medium px-2.5 py-1.5 rounded-lg border outline-none appearance-none cursor-pointer",
                    STATUS_STYLES[task.status],
                    !canEdit && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>

                <span className={cn("text-xs font-medium px-2.5 py-1.5 rounded-lg border", PRIORITY_STYLES[task.priority as keyof typeof PRIORITY_STYLES])}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>

                {task.is_recurring && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700">
                    <RotateCw className="w-3 h-3" />
                    {task.recurrence_type}
                  </span>
                )}
                
                {(task.tags || []).map((tag: string) => (
                  <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg border border-neutral-200">
                    <Tag className="w-3 h-3 text-neutral-400" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500">Assigned To</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[9px] font-bold">
                      {getInitials(assignedName)}
                    </div>
                    <span className="text-sm font-medium text-neutral-900">{assignedName}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-neutral-500">Created By</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 text-[9px] font-bold">
                      {getInitials(assignerName)}
                    </div>
                    <span className="text-sm font-medium text-neutral-700">{assignerName}</span>
                  </div>
                </div>

                {task.due_date && (
                  <div className="space-y-1">
                    <span className="text-xs text-neutral-500">Due Date</span>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-900">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      {formatDate(task.due_date)}
                    </div>
                  </div>
                )}

                {task.due_time && (
                  <div className="space-y-1">
                    <span className="text-xs text-neutral-500">Due Time</span>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-900">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      {task.due_time}
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs for Checklist, Comments, Activity */}
              <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="mt-8 border-t border-neutral-100 pt-6">
                <Tabs.List className="flex gap-6 border-b border-neutral-100 mb-6">
                  <Tabs.Trigger 
                    value="checklist"
                    className={cn(
                      "pb-3 text-sm font-medium transition-colors border-b-2",
                      activeTab === "checklist" ? "border-primary-600 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-700"
                    )}
                  >
                    Checklist
                    {task.checklist_total ? (
                      <span className="ml-2 text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-full">
                        {task.checklist_done}/{task.checklist_total}
                      </span>
                    ) : null}
                  </Tabs.Trigger>
                  <Tabs.Trigger 
                    value="comments"
                    className={cn(
                      "pb-3 text-sm font-medium transition-colors border-b-2",
                      activeTab === "comments" ? "border-primary-600 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-700"
                    )}
                  >
                    Comments
                    {task.comment_count ? (
                      <span className="ml-2 text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-full">
                        {task.comment_count}
                      </span>
                    ) : null}
                  </Tabs.Trigger>
                  <Tabs.Trigger 
                    value="activity"
                    className={cn(
                      "pb-3 text-sm font-medium transition-colors border-b-2",
                      activeTab === "activity" ? "border-primary-600 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-700"
                    )}
                  >
                    Activity Log
                  </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="checklist" className="outline-none">
                  <TaskChecklist taskId={task.id} canEdit={canEdit} />
                </Tabs.Content>
                
                <Tabs.Content value="comments" className="outline-none h-[400px]">
                  <TaskComments taskId={task.id} currentUserId={currentUserId} isAdminOrHR={isAdminOrHR} />
                </Tabs.Content>
                
                <Tabs.Content value="activity" className="outline-none">
                  <TaskActivityLog taskId={task.id} />
                </Tabs.Content>
              </Tabs.Root>

            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
