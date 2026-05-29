"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TaskChecklistItem } from "@/lib/types";

export async function getChecklists(taskId: string): Promise<TaskChecklistItem[]> {
  try {
    const items = await db.taskChecklist.findMany({
      where: { task_id: taskId },
      orderBy: { sort_order: "asc" },
    });
    return items.map((i: any) => ({
      ...i,
      created_at: i.created_at.toISOString(),
      updated_at: i.updated_at.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch checklists:", error);
    return [];
  }
}

export async function addChecklistItem(taskId: string, title: string) {
  try {
    // Get the current max sort_order for this task
    const maxItem = await db.taskChecklist.findFirst({
      where: { task_id: taskId },
      orderBy: { sort_order: "desc" },
    });
    const nextOrder = (maxItem?.sort_order ?? -1) + 1;

    const item = await db.taskChecklist.create({
      data: {
        task_id: taskId,
        title: title.trim(),
        is_done: false,
        sort_order: nextOrder,
      },
    });
    return { 
      success: true, 
      item: {
        ...item,
        created_at: item.created_at.toISOString(),
        updated_at: item.updated_at.toISOString(),
      }
    };
  } catch (error: any) {
    console.error("Failed to add checklist item:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleChecklistItem(id: string) {
  try {
    const item = await db.taskChecklist.findUnique({ where: { id } });
    if (!item) return { success: false, error: "Item not found" };

    const updated = await db.taskChecklist.update({
      where: { id },
      data: { is_done: !item.is_done },
    });
    return { 
      success: true, 
      item: {
        ...updated,
        created_at: updated.created_at.toISOString(),
        updated_at: updated.updated_at.toISOString(),
      }
    };
  } catch (error: any) {
    console.error("Failed to toggle checklist item:", error);
    return { success: false, error: error.message };
  }
}

export async function updateChecklistItemTitle(id: string, title: string) {
  try {
    const updated = await db.taskChecklist.update({
      where: { id },
      data: { title: title.trim() },
    });
    return { 
      success: true, 
      item: {
        ...updated,
        created_at: updated.created_at.toISOString(),
        updated_at: updated.updated_at.toISOString(),
      }
    };
  } catch (error: any) {
    console.error("Failed to update checklist item:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteChecklistItem(id: string) {
  try {
    await db.taskChecklist.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete checklist item:", error);
    return { success: false, error: error.message };
  }
}

export async function reorderChecklist(items: { id: string; sort_order: number }[]) {
  try {
    // Update all items in a transaction
    await db.$transaction(
      items.map((item) =>
        db.taskChecklist.update({
          where: { id: item.id },
          data: { sort_order: item.sort_order },
        })
      )
    );
    return { success: true };
  } catch (error: any) {
    console.error("Failed to reorder checklist:", error);
    return { success: false, error: error.message };
  }
}
