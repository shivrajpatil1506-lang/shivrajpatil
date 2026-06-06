"use client";

import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, Calendar, Flag, User, Clock, Tag } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { createTask, updateTask } from "@/app/actions/tasks";
import { Task } from "@/lib/types";
import { z } from "zod";
import { cn } from "@/lib/utils";

// --- Validation Schema ---
const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.string().optional(),
  due_time: z.string().optional(),
  assigned_to: z.string().min(1, "Assignee is required"),
  tags: z.array(z.string()).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskModalProps {
  employees: any[];
  currentUserId?: string;
  existingTask?: Task;
  trigger?: React.ReactNode;
  hideTrigger?: boolean;
  onTaskSaved?: () => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function TaskModal({ 
  employees, 
  currentUserId, 
  existingTask, 
  trigger,
  hideTrigger = false,
  onTaskSaved, 
  isOpen, 
  setIsOpen 
}: TaskModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const onOpenChange = setIsOpen !== undefined ? setIsOpen : setInternalOpen;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});
  const { success, error: toastError } = useToast();

  const isEdit = !!existingTask;

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    due_time: "",
    assigned_to: currentUserId || "",
    tags: []
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (existingTask) {
      setFormData({
        title: existingTask.title,
        description: existingTask.description || "",
        priority: existingTask.priority as any,
        due_date: existingTask.due_date ? new Date(existingTask.due_date).toISOString().split('T')[0] : "",
        due_time: existingTask.due_time || "",
        assigned_to: existingTask.assigned_to || currentUserId || "",
        tags: Array.isArray(existingTask.tags) ? existingTask.tags : []
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        due_time: "",
        assigned_to: currentUserId || (employees.length > 0 ? employees[0].id : ""),
        tags: []
      });
    }
    setErrors({});
    setTagInput("");
  }, [existingTask, currentUserId, employees, open]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !formData.tags?.includes(newTag)) {
        setFormData(p => ({ ...p, tags: [...(p.tags || []), newTag] }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(p => ({ ...p, tags: p.tags?.filter(t => t !== tagToRemove) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const parsed = taskSchema.safeParse(formData);
    if (!parsed.success) {
      const formattedErrors: any = {};
      parsed.error.issues.forEach(issue => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    
    let res;
    if (isEdit) {
      res = await updateTask(existingTask!.id, parsed.data);
    } else {
      res = await createTask(parsed.data);
    }
    
    setLoading(false);
    
    if (res.success) {
      onOpenChange(false);
      success(isEdit ? "Task Updated" : "Task Created", `"${formData.title}" was successfully ${isEdit ? 'updated' : 'created'}.`);
      if (onTaskSaved) onTaskSaved();
    } else {
      toastError("Error", res.error);
    }
  };

  const defaultTrigger = (
    <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
      <Plus className="w-4 h-4" /> Add Task
    </button>
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : <Dialog.Trigger asChild>{defaultTrigger}</Dialog.Trigger>
      )}
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
            <Dialog.Title className="text-lg font-semibold text-neutral-900">
              {isEdit ? 'Edit Task' : 'Create New Task'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form Content */}
          <div className="overflow-y-auto flex-1">
            <form id="task-form" onSubmit={handleSubmit} className="p-6 space-y-5 text-left">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">Task Title <span className="text-red-500">*</span></label>
                <input 
                  value={formData.title} 
                  onChange={e => setFormData(p => ({...p, title: e.target.value}))} 
                  type="text" 
                  className={cn(
                    "w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors",
                    errors.title ? "border-red-300 focus:ring-red-500" : "border-neutral-200"
                  )}
                  placeholder="E.g. Review Q3 financials" 
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData(p => ({...p, description: e.target.value}))} 
                  rows={3} 
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-colors" 
                  placeholder="Add details, instructions, or notes..." 
                />
              </div>

              {/* Grid: Priority & Assignee */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    <Flag className="w-3.5 h-3.5 text-neutral-400" /> Priority
                  </label>
                  <select 
                    value={formData.priority} 
                    onChange={e => setFormData(p => ({...p, priority: e.target.value as any}))} 
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-neutral-400" /> Assign To <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.assigned_to} 
                    onChange={e => setFormData(p => ({...p, assigned_to: e.target.value}))} 
                    className={cn(
                      "w-full px-3 py-2 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-colors",
                      errors.assigned_to ? "border-red-300 focus:ring-red-500" : "border-neutral-200"
                    )}
                  >
                    <option value="">Select Assignee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.portal_role})</option>
                    ))}
                  </select>
                  {errors.assigned_to && <p className="text-xs text-red-500 mt-1">{errors.assigned_to}</p>}
                </div>
              </div>

              {/* Grid: Due Date & Time */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" /> Due Date
                  </label>
                  <input 
                    type="date" 
                    value={formData.due_date} 
                    onChange={e => setFormData(p => ({...p, due_date: e.target.value}))} 
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" /> Due Time
                  </label>
                  <input 
                    type="time" 
                    value={formData.due_time} 
                    onChange={e => setFormData(p => ({...p, due_time: e.target.value}))} 
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-colors" 
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-neutral-400" /> Tags
                </label>
                <div className="p-1 border border-neutral-200 rounded-lg flex flex-wrap gap-1.5 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all bg-white min-h-[42px]">
                  {formData.tags?.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-md">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="text-neutral-400 hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={formData.tags?.length ? "" : "Add tags (press Enter)"}
                    className="flex-1 min-w-[120px] text-sm bg-transparent border-none outline-none px-2 py-1"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Press Enter or comma to add a tag.</p>
              </div>

            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3">
            <Dialog.Close asChild>
              <button type="button" className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                Cancel
              </button>
            </Dialog.Close>
            <button 
              type="submit" 
              form="task-form"
              disabled={loading} 
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-70 flex items-center justify-center min-w-[120px] shadow-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isEdit ? "Save Changes" : "Create Task"
              )}
            </button>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
