"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Search } from "lucide-react";
import KanbanBoard from "@/components/features/KanbanBoard";
import TaskModal from "@/components/features/TaskModal";
import { getTasks } from "@/app/actions/tasks";
import { Task } from "@/lib/types";

export default function MyWorkClient({ 
  initialTasks, 
  employees, 
  isAdminOrHR, 
  currentUserId 
}: { 
  initialTasks: Task[], 
  employees: any[], 
  isAdminOrHR: boolean, 
  currentUserId: string 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const refreshTasks = async () => {
    const freshTasks = await getTasks();
    setTasks(freshTasks);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="My Work" 
        description="Kanban task board" 
        actions={<TaskModal employees={employees} currentUserId={currentUserId} onTaskSaved={refreshTasks} />} 
      />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none" 
          />
        </div>
        <select 
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option>All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <KanbanBoard 
        initialTasks={tasks} 
        searchQuery={searchQuery} 
        priorityFilter={priorityFilter} 
        isAdminOrHR={isAdminOrHR}
        employees={employees}
        currentUserId={currentUserId}
        onTaskChange={refreshTasks}
      />
    </div>
  );
}
