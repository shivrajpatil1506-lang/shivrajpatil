"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import KanbanBoard from "@/components/features/KanbanBoard";
import TaskModal from "@/components/features/TaskModal";
import TaskDetailPanel from "@/components/features/TaskDetailPanel";
import TaskFilters from "@/components/features/TaskFilters";
import TaskStats from "@/components/features/TaskStats";
import TaskListView from "@/components/features/TaskListView";
import { getTasks, getTaskById } from "@/app/actions/tasks";
import { Task } from "@/lib/types";

export default function MyWorkClient({
  initialTasks,
  employees,
  isAdminOrHR,
  currentUserId,
}: {
  initialTasks: Task[];
  employees: any[];
  isAdminOrHR: boolean;
  currentUserId: string;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Detail panel loading state
  const [fullTask, setFullTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  const refreshTasks = async () => {
    const freshTasks = await getTasks();
    setTasks(freshTasks);
  };

  const handleTaskClick = async (task: Task) => {
    setIsDetailOpen(true);
    setFullTask(task); // optimistic basic load
    const full = await getTaskById(task.id);
    if (full) {
      setFullTask(full.task); // replace with full counts
    }
  };

  const handleTaskDetailClose = () => {
    setIsDetailOpen(false);
    setTimeout(() => setFullTask(null), 300); // clear after animation
  };

  // Filter tasks based on all active filters
  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q);
    const matchPriority =
      priorityFilter === "All" ||
      t.priority.toLowerCase() === priorityFilter.toLowerCase();
    const matchAssignee = 
      assigneeFilter === "All" || 
      t.assigned_to === assigneeFilter;

    return matchSearch && matchPriority && matchAssignee;
  });

  const overdueCount = tasks.filter(t => {
    if (!t.due_date || t.status === "done") return false;
    return new Date(t.due_date) < new Date(new Date().setHours(0,0,0,0));
  }).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My Work"
        description="Manage your tasks and track team progress"
        actions={
          <TaskModal
            employees={employees}
            currentUserId={currentUserId}
            onTaskSaved={refreshTasks}
          />
        }
      />

      <TaskStats tasks={tasks} />

      <TaskFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        assigneeFilter={assigneeFilter}
        setAssigneeFilter={setAssigneeFilter}
        employees={employees}
        isAdminOrHR={isAdminOrHR}
        viewMode={viewMode}
        setViewMode={setViewMode}
        taskCount={filteredTasks.length}
        overdueCount={overdueCount}
      />

      {viewMode === "kanban" ? (
        <KanbanBoard
          initialTasks={filteredTasks}
          searchQuery="" // Already filtered above
          priorityFilter="All Priorities" // Already filtered above
          isAdminOrHR={isAdminOrHR}
          employees={employees}
          currentUserId={currentUserId}
          onTaskChange={refreshTasks}
          onTaskClick={handleTaskClick}
        />
      ) : (
        <TaskListView
          tasks={filteredTasks}
          employees={employees}
          currentUserId={currentUserId}
          onTaskClick={handleTaskClick}
        />
      )}

      <TaskDetailPanel
        task={fullTask}
        isOpen={isDetailOpen}
        onClose={handleTaskDetailClose}
        employees={employees}
        currentUserId={currentUserId}
        isAdminOrHR={isAdminOrHR}
        onTaskChange={() => {
          refreshTasks();
          if (fullTask) handleTaskClick(fullTask); // reload full task details
        }}
      />
    </div>
  );
}
