"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn, getInitials, formatDate } from "@/lib/utils";
import { TASK_STATUS_LABELS } from "@/lib/constants";
import { Task } from "@/lib/types";
import { updateTaskStatus, deleteTask, reorderTasks } from "@/app/actions/tasks";
import {
  RotateCw, Calendar, MoreHorizontal, CheckCircle2,
  ArrowRightCircle, CircleDashed, Trash2, Pencil,
  MessageSquare, GripVertical, Tag, Clock,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import TaskModal from "./TaskModal";

// ── Constants ────────────────────────────────────────────────────────────────

const COLUMNS = ["todo", "in_progress", "review", "done"] as const;
type TaskStatus = typeof COLUMNS[number];

const COLUMN_STYLES: Record<string, { border: string; header: string; bg: string; dot: string }> = {
  todo:        { border: "border-t-neutral-400",  header: "text-neutral-600",  bg: "bg-neutral-50",    dot: "bg-neutral-400" },
  in_progress: { border: "border-t-blue-500",     header: "text-blue-700",     bg: "bg-blue-50/40",   dot: "bg-blue-500" },
  review:      { border: "border-t-purple-500",   header: "text-purple-700",   bg: "bg-purple-50/40", dot: "bg-purple-500" },
  done:        { border: "border-t-emerald-500",  header: "text-emerald-700",  bg: "bg-emerald-50/40",dot: "bg-emerald-500" },
};

const PRIORITY_CONFIG = {
  high:   { dot: "bg-red-500",     badge: "bg-red-50 text-red-600 border-red-200" },
  medium: { dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  low:    { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function isOverdue(task: Task) {
  if (!task.due_date || task.status === "done") return false;
  return new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0));
}

function isDueToday(task: Task) {
  if (!task.due_date || task.status === "done") return false;
  const today = new Date().toISOString().split("T")[0];
  return task.due_date.split("T")[0] === today;
}

function getNextStatusAction(status: string) {
  if (status === "todo")        return { label: "Start",    next: "in_progress", icon: <CircleDashed className="w-3 h-3" /> };
  if (status === "in_progress") return { label: "Review",   next: "review",      icon: <ArrowRightCircle className="w-3 h-3" /> };
  if (status === "review")      return { label: "Done",     next: "done",        icon: <CheckCircle2 className="w-3 h-3" /> };
  return null;
}

// ── Droppable Column ─────────────────────────────────────────────────────────

function DroppableColumn({
  status, children, count,
}: {
  status: string;
  children: React.ReactNode;
  count: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const s = COLUMN_STYLES[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border-t-4 flex flex-col min-h-[200px] transition-all duration-200",
        s.border, s.bg,
        isOver && "ring-2 ring-primary-300 ring-offset-1 scale-[1.01]"
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", s.dot)} />
          <h3 className={cn("text-xs font-semibold uppercase tracking-wide", s.header)}>
            {TASK_STATUS_LABELS[status]}
          </h3>
        </div>
        <span className="text-xs text-neutral-400 bg-white rounded-full px-2 py-0.5 border border-neutral-200 font-medium">
          {count}
        </span>
      </div>

      {/* Drop zone hint */}
      {isOver && (
        <div className="mx-3 mb-2 h-1 rounded-full bg-primary-300 opacity-70 transition-all" />
      )}

      <div className="flex-1 p-2 space-y-2">{children}</div>
    </div>
  );
}

// ── Sortable Task Card ───────────────────────────────────────────────────────

function SortableTaskCard({
  task, employees, currentUserId, isAdminOrHR,
  onStatusChange, onDelete, onEdit, onCardClick, isDragOverlay,
}: {
  task: Task;
  employees: any[];
  currentUserId: string;
  isAdminOrHR: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onCardClick: (task: Task) => void;
  isDragOverlay?: boolean;
}) {
  const canDrag = isAdminOrHR || task.assigned_to === currentUserId;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !canDrag,
    data: { task },
  });

  const style = transform
    ? { 
        transform: CSS.Transform.toString(transform),
        transition: isDragOverlay ? undefined : transition 
      }
    : undefined;

  const overdue = isOverdue(task);
  const dueToday = !overdue && isDueToday(task);
  const primaryAction = getNextStatusAction(task.status);
  const assignee = employees.find((e) => e.id === task.assigned_to);
  const assignedName = assignee
    ? `${assignee.first_name} ${assignee.last_name}`
    : task.assigned_to === currentUserId
    ? "Me"
    : "Unassigned";

  const tags: string[] = Array.isArray(task.tags) ? task.tags : [];
  const checklistTotal = task.checklist_total ?? 0;
  const checklistDone = task.checklist_done ?? 0;
  const commentCount = task.comment_count ?? 0;
  const hasChecklist = checklistTotal > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white rounded-lg border border-neutral-100 shadow-sm select-none",
        "hover:shadow-md hover:border-primary-200 transition-all duration-200 group",
        "flex flex-col overflow-hidden",
        isDragging && "opacity-30 shadow-none",
        isDragOverlay && "shadow-2xl rotate-1 scale-105 ring-2 ring-primary-300",
        overdue && "border-l-4 border-l-red-400",
        dueToday && !overdue && "border-l-4 border-l-amber-400",
      )}
    >
      {/* Drag handle + title row */}
      <div className="flex items-start gap-1 p-3 pb-2">
        {/* Drag handle */}
        {canDrag && !isDragOverlay && (
          <button
            {...listeners}
            {...attributes}
            className="mt-0.5 p-0.5 text-neutral-300 hover:text-neutral-500 cursor-grab active:cursor-grabbing touch-none shrink-0"
            aria-label="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Title */}
        <button
          className="flex-1 text-left"
          onClick={() => onCardClick(task)}
        >
          <h4 className="text-sm font-medium text-neutral-900 leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
            {task.title}
          </h4>
        </button>

        {/* Actions menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              className="min-w-[160px] bg-white rounded-lg shadow-lg border border-neutral-100 p-1 z-50 text-sm animate-in fade-in zoom-in-95"
            >
              <DropdownMenu.Label className="px-2 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Move to
              </DropdownMenu.Label>
              {COLUMNS.map((col) =>
                col !== task.status ? (
                  <DropdownMenu.Item
                    key={col}
                    onClick={() => onStatusChange(task.id, col)}
                    className="flex items-center px-2 py-1.5 cursor-pointer outline-none hover:bg-neutral-50 rounded text-neutral-700"
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full mr-2", COLUMN_STYLES[col].dot)} />
                    {TASK_STATUS_LABELS[col]}
                  </DropdownMenu.Item>
                ) : null
              )}

              {isAdminOrHR && (
                <>
                  <DropdownMenu.Separator className="h-px bg-neutral-100 my-1" />
                  <DropdownMenu.Item
                    onClick={() => onEdit(task)}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer outline-none hover:bg-neutral-50 rounded text-neutral-700"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onClick={() => onDelete(task.id)}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer outline-none hover:bg-red-50 rounded text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Body — clickable */}
      <button className="flex-1 text-left px-3 pb-2 space-y-2" onClick={() => onCardClick(task)}>
        {/* Priority + recurring */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border",
              PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]?.badge
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]?.dot)} />
            {task.priority}
          </span>
          {task.is_recurring && (
            <span title="Recurring task">
              <RotateCw className="w-3 h-3 text-neutral-400" />
            </span>
          )}
          {overdue && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-red-600">
              <AlertCircle className="w-3 h-3" /> Overdue
            </span>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded border border-primary-100"
              >
                <Tag className="w-2 h-2" />
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] text-neutral-400">+{tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Due date */}
        {task.due_date && (
          <div className={cn(
            "flex items-center gap-1 text-[10px]",
            overdue ? "text-red-600 font-medium" : dueToday ? "text-amber-600 font-medium" : "text-neutral-500"
          )}>
            <Calendar className="w-3 h-3" />
            {overdue ? "Overdue · " : dueToday ? "Due today · " : ""}{formatDate(task.due_date)}
            {task.due_time && (
              <span className="flex items-center gap-0.5 ml-1">
                <Clock className="w-2.5 h-2.5" />
                {task.due_time}
              </span>
            )}
          </div>
        )}

        {/* Checklist progress */}
        {hasChecklist && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-neutral-500">
              <span>{checklistDone}/{checklistTotal} subtasks</span>
              <span className="font-medium text-neutral-700">
                {Math.round((checklistDone / checklistTotal) * 100)}%
              </span>
            </div>
            <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  checklistDone === checklistTotal ? "bg-emerald-500" : "bg-primary-400"
                )}
                style={{ width: `${(checklistDone / checklistTotal) * 100}%` }}
              />
            </div>
          </div>
        )}
      </button>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-neutral-50">
        <div className="flex items-center gap-2">
          {/* Assignee avatar */}
          <div
            className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[8px] font-bold shrink-0"
            title={assignedName}
          >
            {getInitials(assignedName)}
          </div>

          {/* Comment count */}
          {commentCount > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
              <MessageSquare className="w-3 h-3" />
              {commentCount}
            </span>
          )}
        </div>

        {/* Quick status advance */}
        {primaryAction && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, primaryAction.next as TaskStatus);
            }}
            className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 bg-neutral-50 text-neutral-600 rounded border border-neutral-200 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors"
          >
            {primaryAction.icon}
            {primaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Kanban Board ────────────────────────────────────────────────────────

export default function KanbanBoard({
  initialTasks,
  searchQuery,
  priorityFilter,
  isAdminOrHR = false,
  employees = [],
  currentUserId = "",
  onTaskChange,
  onTaskClick,
}: {
  initialTasks: Task[];
  searchQuery: string;
  priorityFilter: string;
  isAdminOrHR?: boolean;
  employees?: any[];
  currentUserId?: string;
  onTaskChange?: () => void;
  onTaskClick?: (task: Task) => void;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { success, error: toastError } = useToast();

  React.useEffect(() => { setTasks(initialTasks); }, [initialTasks]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  // ── Filter ──────────────────────────────────────────────────────────────

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q);
      const matchPriority =
        priorityFilter === "All Priorities" ||
        t.priority.toLowerCase() === priorityFilter.toLowerCase();
      return matchSearch && matchPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  const tasksByStatus = useMemo(() => {
    return COLUMNS.reduce((acc, status) => {
      acc[status] = filteredTasks.filter((t) => t.status === status);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [filteredTasks]);

  // ── DnD handlers ────────────────────────────────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }, [tasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      const overIndex = prev.findIndex((t) => t.id === overId);

      const activeTask = prev[activeIndex];
      if (!activeTask) return prev;

      // Ensure permission check handles early visual moving
      if (!isAdminOrHR && activeTask.assigned_to !== currentUserId) {
         return prev;
      }

      const overTask = prev[overIndex];
      const activeStatus = activeTask.status;
      const overStatus = overTask ? overTask.status : (overId as TaskStatus);

      // We only care about moving across columns in DragOver
      if (activeStatus !== overStatus) {
        const newTasks = [...prev];
        // Move to the new status
        newTasks[activeIndex] = { ...newTasks[activeIndex], status: overStatus };
        
        // Push below the over item, or to the end if over is a column
        const finalOverIndex = overIndex >= 0 ? overIndex : newTasks.length - 1;
        return arrayMove(newTasks, activeIndex, finalOverIndex);
      }

      return prev;
    });
  }, [isAdminOrHR, currentUserId]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      const overIndex = prev.findIndex((t) => t.id === overId);

      let newTasks = prev;

      if (activeIndex !== overIndex && overIndex !== -1) {
        newTasks = arrayMove(newTasks, activeIndex, overIndex);
      }

      const movedTask = newTasks.find(t => t.id === activeId);
      if (!movedTask) return newTasks;

      const updatedColumnTasks = newTasks.filter(t => t.status === movedTask.status);
      const reorderPayload = updatedColumnTasks.map((t, i) => ({
        id: t.id,
        sort_order: i,
        status: t.status
      }));

      // Fire API in background
      reorderTasks(reorderPayload).catch(e => {
        console.error("Failed to reorder tasks", e);
        toastError("Error", "Failed to save task order.");
      });

      return newTasks;
    });
  }, [toastError]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const oldStatus = task.status;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    const res = await updateTaskStatus(taskId, newStatus);
    if (res.success) {
      success("Task Updated", `Moved to ${TASK_STATUS_LABELS[newStatus]}`);
      if (onTaskChange) onTaskChange();
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: oldStatus } : t))
      );
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    const prevTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const res = await deleteTask(taskId);
    if (res.success) {
      success("Task Deleted", "The task has been removed.");
      if (onTaskChange) onTaskChange();
    } else {
      setTasks(prevTasks);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((status) => (
            <DroppableColumn
              key={status}
              status={status}
              count={tasksByStatus[status].length}
            >
              <SortableContext items={tasksByStatus[status].map(t => t.id)} strategy={verticalListSortingStrategy}>
                {tasksByStatus[status].map((task) => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    employees={employees}
                    currentUserId={currentUserId}
                    isAdminOrHR={isAdminOrHR}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onCardClick={onTaskClick ?? (() => {})}
                  />
                ))}
              </SortableContext>

              {tasksByStatus[status].length === 0 && (
                <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-neutral-200 rounded-lg">
                  <p className="text-xs text-neutral-400">Drop tasks here</p>
                </div>
              )}
            </DroppableColumn>
          ))}
        </div>

        {/* Drag Overlay — ghost card that follows the cursor */}
        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {activeTask ? (
            <SortableTaskCard
              task={activeTask}
              employees={employees}
              currentUserId={currentUserId}
              isAdminOrHR={isAdminOrHR}
              onStatusChange={() => {}}
              onDelete={() => {}}
              onEdit={() => {}}
              onCardClick={() => {}}
              isDragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Edit Modal */}
      <TaskModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        existingTask={editingTask || undefined}
        employees={employees}
        currentUserId={currentUserId}
        hideTrigger={true}
        onTaskSaved={() => {
          setIsEditModalOpen(false);
          if (onTaskChange) onTaskChange();
        }}
      />
    </>
  );
}
