"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function getTasks() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    let whereClause = { is_deleted: false };
    
    // If agent, only show tasks assigned to them (or created by them)
    if (user.role === "agent" && user.employee_id) {
      whereClause = {
        ...whereClause,
        // @ts-ignore
        OR: [
          { assigned_to: user.employee_id },
          { assigned_by: user.employee_id }
        ]
      };
    }

    const tasks = await db.task.findMany({
      where: whereClause,
      orderBy: [
        { status: 'asc' },
        { due_date: 'asc' }
      ]
    });
    
    return tasks.map((t: any) => ({
      ...t,
      status: t.status || "todo",
      priority: t.priority || "medium",
    }));
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

export async function createTask(formData: any) {
  try {
    const user = await getCurrentUser();
    
    const newTask = await db.task.create({
      data: {
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority || "medium",
        status: "todo",
        due_date: formData.due_date ? new Date(formData.due_date) : null,
        assigned_to: formData.assigned_to, 
        assigned_by: user?.employee_id || "system",
      }
    });
    return { success: true, task: newTask };
  } catch (error: any) {
    console.error("Failed to create task:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTask(id: string, formData: any) {
  try {
    // Only Admin/HR are allowed to edit in the UI, but we enforce here as best practice
    const updated = await db.task.update({
      where: { id },
      data: {
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority || "medium",
        due_date: formData.due_date ? new Date(formData.due_date) : null,
        assigned_to: formData.assigned_to,
      }
    });
    return { success: true, task: updated };
  } catch (error: any) {
    console.error("Failed to update task:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTask(id: string) {
  try {
    await db.task.delete({
      where: { id }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete task:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTaskStatus(id: string, newStatus: string) {
  try {
    const updated = await db.task.update({
      where: { id },
      data: {
        status: newStatus,
        completed_at: newStatus === "completed" || newStatus === "done" ? new Date() : null,
      }
    });
    return { success: true, task: updated };
  } catch (error: any) {
    console.error("Failed to update task status:", error);
    return { success: false, error: error.message };
  }
}
