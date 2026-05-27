"use client";

import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, Calendar, Flag, User, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { createTask, updateTask } from "@/app/actions/tasks";
import { Task } from "@/lib/types";

interface TaskModalProps {
  employees: any[];
  currentUserId?: string;
  existingTask?: Task;
  trigger?: React.ReactNode;
  onTaskSaved?: () => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function TaskModal({ employees, currentUserId, existingTask, trigger, onTaskSaved, isOpen, setIsOpen }: TaskModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const onOpenChange = setIsOpen !== undefined ? setIsOpen : setInternalOpen;

  const [loading, setLoading] = useState(false);
  const { success } = useToast();

  const isEdit = !!existingTask;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    assigned_to: currentUserId || ""
  });

  useEffect(() => {
    if (existingTask) {
      setFormData({
        title: existingTask.title,
        description: existingTask.description || "",
        priority: existingTask.priority,
        due_date: existingTask.due_date ? new Date(existingTask.due_date).toISOString().split('T')[0] : "",
        assigned_to: existingTask.assigned_to || currentUserId || ""
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        assigned_to: currentUserId || (employees.length > 0 ? employees[0].id : "")
      });
    }
  }, [existingTask, currentUserId, employees, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let res;
    if (isEdit) {
      res = await updateTask(existingTask!.id, formData);
    } else {
      res = await createTask(formData);
    }
    
    setLoading(false);
    
    if (res.success) {
      onOpenChange(false);
      success(isEdit ? "Task Updated" : "Task Created", `"${formData.title}" was ${isEdit ? 'updated' : 'added to your To Do list'}.`);
      if (onTaskSaved) onTaskSaved();
    } else {
      console.error(res.error);
    }
  };

  const defaultTrigger = (
    <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
      <Plus className="w-4 h-4" /> Add Task
    </button>
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : <Dialog.Trigger asChild>{defaultTrigger}</Dialog.Trigger>}
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
            <Dialog.Title className="text-base font-semibold text-neutral-900">{isEdit ? 'Edit Task' : 'Create New Task'}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">Task Title *</label>
              <input required value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} type="text" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="What needs to be done?" />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">Description</label>
              <textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} rows={3} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Add more details..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5 flex items-center gap-1"><Flag className="w-3 h-3 text-neutral-400" /> Priority</label>
                <select value={formData.priority} onChange={e => setFormData(p => ({...p, priority: e.target.value}))} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3 text-neutral-400" /> Due Date</label>
                <input type="date" value={formData.due_date} onChange={e => setFormData(p => ({...p, due_date: e.target.value}))} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5 flex items-center gap-1"><User className="w-3 h-3 text-neutral-400" /> Assign To</label>
              <select value={formData.assigned_to} onChange={e => setFormData(p => ({...p, assigned_to: e.target.value}))} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.portal_role})</option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Dialog.Close asChild>
                <button type="button" className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">Cancel</button>
              </Dialog.Close>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-70">
                {loading ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Task")}
              </button>
            </div>
          </form>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
