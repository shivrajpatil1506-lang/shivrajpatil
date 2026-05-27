"use client";

import React, { useState } from "react";
import { cn, getInitials, formatDate } from "@/lib/utils";
import { TASK_STATUS_LABELS } from "@/lib/constants";
import { Task } from "@/lib/types";
import { updateTaskStatus, deleteTask } from "@/app/actions/tasks";
import { RotateCw, Calendar, MoreHorizontal, CheckCircle2, ArrowRightCircle, CircleDashed, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import TaskModal from "./TaskModal";

const columns = ["todo", "in_progress", "review", "done"] as const;
type TaskStatus = typeof columns[number];

const columnColors: Record<string, string> = {
  todo: "border-neutral-300",
  in_progress: "border-blue-400",
  review: "border-purple-400",
  done: "border-emerald-400",
};

export default function KanbanBoard({ 
  initialTasks, 
  searchQuery, 
  priorityFilter,
  isAdminOrHR = false,
  employees = [],
  currentUserId = "",
  onTaskChange
}: { 
  initialTasks: Task[], 
  searchQuery: string, 
  priorityFilter: string,
  isAdminOrHR?: boolean,
  employees?: any[],
  currentUserId?: string,
  onTaskChange?: () => void
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const { success } = useToast();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    const res = await updateTaskStatus(taskId, newStatus);
    if (res.success) {
      success("Task Updated", `Task moved to ${TASK_STATUS_LABELS[newStatus]}`);
    } else {
      setTasks(initialTasks);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    const prevTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    const res = await deleteTask(taskId);
    if (res.success) {
      success("Task Deleted", "The task was permanently removed.");
      if (onTaskChange) onTaskChange();
    } else {
      setTasks(prevTasks);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || t.title.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
    const matchPriority = priorityFilter === "All Priorities" || t.priority.toLowerCase() === priorityFilter.toLowerCase();
    return matchSearch && matchPriority;
  });

  const tasksByStatus = columns.reduce((acc, status) => {
    acc[status] = filteredTasks.filter(t => t.status === status);
    return acc;
  }, {} as Record<string, Task[]>);

  const getNextStatusAction = (status: string) => {
    if (status === "todo") return { label: "Start Progress", next: "in_progress", icon: <CircleDashed className="w-3.5 h-3.5" /> };
    if (status === "in_progress") return { label: "Send to Review", next: "review", icon: <ArrowRightCircle className="w-3.5 h-3.5" /> };
    if (status === "review") return { label: "Mark Done", next: "done", icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
    return null;
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {columns.map(status => (
          <div key={status} className={cn("bg-neutral-50 rounded-xl p-3 border-t-4 flex flex-col h-full", columnColors[status])}>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-semibold text-neutral-700">{TASK_STATUS_LABELS[status]}</h3>
              <span className="text-xs text-neutral-400 bg-white rounded-full px-2 py-0.5 border border-neutral-200">{tasksByStatus[status].length}</span>
            </div>
            
            <div className="space-y-3 flex-1">
              {tasksByStatus[status].map(task => {
                const primaryAction = getNextStatusAction(task.status);
                // Assignee name mapping
                const assignee = employees.find(e => e.id === task.assigned_to);
                const assignedName = assignee ? `${assignee.first_name} ${assignee.last_name}` : (task.assigned_to === currentUserId ? "Me" : "Unknown");
                
                return (
                  <div key={task.id} className="bg-white rounded-lg shadow-sm border border-neutral-100 p-3.5 hover:shadow-md hover:border-primary-200 transition-all group flex flex-col">
                    
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-neutral-900 leading-snug group-hover:text-primary-600 transition-colors flex-1">{task.title}</h4>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="p-1 hover:bg-neutral-100 rounded text-neutral-400 ml-2">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content align="end" className="min-w-[160px] bg-white rounded-lg shadow-lg border border-neutral-100 p-1 z-50 text-sm animate-in fade-in zoom-in-95">
                            <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-neutral-500 uppercase">Move to...</DropdownMenu.Label>
                            {columns.map(col => col !== task.status && (
                              <DropdownMenu.Item 
                                key={col} 
                                onClick={() => handleStatusChange(task.id, col)}
                                className="flex items-center px-2 py-2 cursor-pointer outline-none hover:bg-neutral-50 rounded text-neutral-700"
                              >
                                {TASK_STATUS_LABELS[col]}
                              </DropdownMenu.Item>
                            ))}
                            
                            {isAdminOrHR && (
                              <>
                                <DropdownMenu.Separator className="h-px bg-neutral-100 my-1" />
                                <DropdownMenu.Item 
                                  onClick={() => openEditModal(task)}
                                  className="flex items-center gap-2 px-2 py-2 cursor-pointer outline-none hover:bg-neutral-50 rounded text-neutral-700"
                                >
                                  <Pencil className="w-4 h-4" /> Edit Task
                                </DropdownMenu.Item>
                                <DropdownMenu.Item 
                                  onClick={() => handleDelete(task.id)}
                                  className="flex items-center gap-2 px-2 py-2 cursor-pointer outline-none hover:bg-red-50 rounded text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" /> Delete Task
                                </DropdownMenu.Item>
                              </>
                            )}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("w-2 h-2 rounded-full", task.priority === "high" ? "bg-red-500" : task.priority === "medium" ? "bg-amber-500" : "bg-emerald-500")} />
                      <span className="text-[10px] text-neutral-500 capitalize">{task.priority}</span>
                      {task.is_recurring && <RotateCw className="w-3.5 h-3.5 text-neutral-400 ml-auto" />}
                    </div>
                    
                    {task.due_date && (
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mb-2">
                        <Calendar className="w-3 h-3" />
                        <span className={cn(new Date(task.due_date) < new Date() && task.status !== "done" && "text-red-600 font-medium")}>
                          {formatDate(task.due_date)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 mt-auto border-t border-neutral-50">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[8px] font-bold" title={assignedName}>
                          {getInitials(assignedName)}
                        </div>
                      </div>
                      
                      {primaryAction && (
                        <button 
                          onClick={() => handleStatusChange(task.id, primaryAction.next as TaskStatus)}
                          className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 bg-neutral-50 text-neutral-600 rounded-md border border-neutral-200 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors"
                        >
                          {primaryAction.icon} {primaryAction.label}
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
              
              {tasksByStatus[status].length === 0 && (
                <div className="p-4 border-2 border-dashed border-neutral-200 rounded-lg text-center">
                  <p className="text-xs text-neutral-400">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <TaskModal 
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        existingTask={editingTask || undefined}
        employees={employees}
        currentUserId={currentUserId}
        onTaskSaved={() => {
          setIsEditModalOpen(false);
          if (onTaskChange) onTaskChange();
        }}
      />
    </>
  );
}
