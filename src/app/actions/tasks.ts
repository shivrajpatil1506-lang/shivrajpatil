"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Task } from "@/lib/types";

// ── Helper ──────────────────────────────────────────────────────────────────

function serializeTask(t: any): Task {
  return {
    ...t,
    tags: t.tags ? JSON.parse(t.tags) : [],
    due_date: t.due_date ? t.due_date.toISOString() : undefined,
    completed_at: t.completed_at ? t.completed_at.toISOString() : undefined,
    created_at: t.created_at.toISOString(),
    updated_at: t.updated_at.toISOString(),
    status: t.status || "todo",
    priority: t.priority || "medium",
    is_recurring: t.is_recurring || false,
    // Computed counts
    checklist_total: t._count?.checklists ?? 0,
    comment_count: t._count?.comments ?? 0,
    checklist_done: t.checklists_done ?? 0,
  };
}

async function logActivity(
  taskId: string,
  action: string,
  oldValue?: string,
  newValue?: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) return;
    await db.taskActivity.create({
      data: {
        task_id: taskId,
        actor_id: user.employee_id || user.uid,
        actor_name: user.name || user.email || "Unknown",
        action,
        old_value: oldValue ?? null,
        new_value: newValue ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to log task activity:", err);
  }
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getTasks(): Promise<Task[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    let whereClause: any = { is_deleted: false };

    if (user.role === "agent" && user.employee_id) {
      whereClause = {
        ...whereClause,
        OR: [
          { assigned_to: user.employee_id },
          { assigned_by: user.employee_id },
        ],
      };
    }

    // For accountant — only own tasks
    if (user.role === "accountant" && user.employee_id) {
      whereClause = {
        ...whereClause,
        assigned_to: user.employee_id,
      };
    }

    const tasks = await db.task.findMany({
      where: whereClause,
      orderBy: [{ sort_order: "asc" }, { due_date: "asc" }, { created_at: "desc" }],
      include: {
        _count: {
          select: {
            comments: { where: { is_deleted: false } },
            checklists: true,
          },
        },
      },
    });

    // For each task also count done checklists
    const taskIds = tasks.map((t: any) => t.id);
    const doneCounts = taskIds.length
      ? await db.taskChecklist.groupBy({
          by: ["task_id"],
          where: { task_id: { in: taskIds }, is_done: true },
          _count: { id: true },
        })
      : [];

    const doneMap: Record<string, number> = {};
    doneCounts.forEach((d: any) => {
      doneMap[d.task_id] = d._count.id;
    });

    return tasks.map((t: any) =>
      serializeTask({ ...t, checklists_done: doneMap[t.id] ?? 0 })
    );
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

export async function getTaskById(id: string) {
  try {
    const task = await db.task.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            comments: { where: { is_deleted: false } },
            checklists: true,
          },
        },
        checklists: { orderBy: { sort_order: "asc" } },
        comments: {
          where: { is_deleted: false },
          orderBy: { created_at: "asc" },
        },
        activities: { orderBy: { created_at: "desc" }, take: 50 },
      },
    });
    if (!task) return null;

    const doneCount = await db.taskChecklist.count({
      where: { task_id: id, is_done: true },
    });

    return {
      task: serializeTask({ ...task, checklists_done: doneCount }),
      checklists: task.checklists.map((c: any) => ({
        ...c,
        created_at: c.created_at.toISOString(),
        updated_at: c.updated_at.toISOString(),
      })),
      comments: task.comments.map((c: any) => ({
        ...c,
        created_at: c.created_at.toISOString(),
      })),
      activities: task.activities.map((a: any) => ({
        ...a,
        created_at: a.created_at.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch task by id:", error);
    return null;
  }
}

export async function getTaskActivities(taskId: string) {
  try {
    const activities = await db.taskActivity.findMany({
      where: { task_id: taskId },
      orderBy: { created_at: "desc" },
      take: 50,
    });
    return activities.map((a: any) => ({
      ...a,
      created_at: a.created_at.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch task activities:", error);
    return [];
  }
}

// ── Mutations ────────────────────────────────────────────────────────────────

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
        due_time: formData.due_time || null,
        assigned_to: formData.assigned_to,
        assigned_by: user?.employee_id || "system",
        tags: formData.tags?.length ? JSON.stringify(formData.tags) : null,
        company_id: formData.company_id || null,
        site_id: formData.site_id || null,
        is_recurring: formData.is_recurring || false,
        recurrence_type: formData.recurrence_type || null,
      },
    });

    await logActivity(newTask.id, "created task");

    return { success: true, task: newTask };
  } catch (error: any) {
    console.error("Failed to create task:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTask(id: string, formData: any) {
  try {
    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Task not found" };

    const updated = await db.task.update({
      where: { id },
      data: {
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority || "medium",
        due_date: formData.due_date ? new Date(formData.due_date) : null,
        due_time: formData.due_time || null,
        assigned_to: formData.assigned_to,
        tags: formData.tags?.length ? JSON.stringify(formData.tags) : null,
        company_id: formData.company_id || null,
        site_id: formData.site_id || null,
      },
    });

    // Log individual changes
    if (existing.priority !== formData.priority) {
      await logActivity(id, "priority changed", existing.priority, formData.priority);
    }
    if (existing.assigned_to !== formData.assigned_to) {
      await logActivity(id, "reassigned", existing.assigned_to, formData.assigned_to);
    }
    if (
      existing.due_date?.toISOString().split("T")[0] !==
      (formData.due_date || null)
    ) {
      await logActivity(
        id,
        "due date changed",
        existing.due_date?.toISOString().split("T")[0] ?? "none",
        formData.due_date || "none"
      );
    }

    return { success: true, task: updated };
  } catch (error: any) {
    console.error("Failed to update task:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTask(id: string) {
  try {
    await logActivity(id, "deleted task");
    await db.task.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete task:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTaskStatus(id: string, newStatus: string) {
  try {
    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Task not found" };

    const oldStatus = existing.status;

    const updated = await db.task.update({
      where: { id },
      data: {
        status: newStatus,
        completed_at:
          newStatus === "done" ? new Date() : null,
      },
    });

    const statusLabels: Record<string, string> = {
      todo: "To Do",
      in_progress: "In Progress",
      review: "Review",
      done: "Done",
    };

    await logActivity(
      id,
      "status changed",
      statusLabels[oldStatus] ?? oldStatus,
      statusLabels[newStatus] ?? newStatus
    );

    return { success: true, task: updated };
  } catch (error: any) {
    console.error("Failed to update task status:", error);
    return { success: false, error: error.message };
  }
}

export async function reorderTasks(tasks: { id: string; sort_order: number; status: string }[]) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Run all updates in a transaction
    await db.$transaction(
      tasks.map((task) =>
        db.task.update({
          where: { id: task.id },
          data: { sort_order: task.sort_order, status: task.status },
        })
      )
    );

    return { success: true };
  } catch (error: any) {
    console.error("Failed to reorder tasks:", error);
    return { success: false, error: error.message };
  }
}
