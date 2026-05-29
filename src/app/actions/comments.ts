"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TaskComment } from "@/lib/types";

export async function getComments(taskId: string): Promise<TaskComment[]> {
  try {
    const comments = await db.taskComment.findMany({
      where: { task_id: taskId, is_deleted: false },
      orderBy: { created_at: "asc" },
    });
    return comments.map((c: any) => ({
      ...c,
      created_at: c.created_at.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return [];
  }
}

export async function addComment(taskId: string, content: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const trimmed = content.trim();
    if (!trimmed) return { success: false, error: "Comment cannot be empty" };

    const comment = await db.taskComment.create({
      data: {
        task_id: taskId,
        author_id: user.employee_id || user.uid,
        author_name: user.name || user.email || "Unknown",
        content: trimmed,
      },
    });

    // Log activity
    await db.taskActivity.create({
      data: {
        task_id: taskId,
        actor_id: user.employee_id || user.uid,
        actor_name: user.name || user.email || "Unknown",
        action: "commented",
        new_value: trimmed.length > 80 ? trimmed.slice(0, 80) + "…" : trimmed,
      },
    });

    return { 
      success: true, 
      comment: {
        ...comment,
        created_at: comment.created_at.toISOString(),
      }
    };
  } catch (error: any) {
    console.error("Failed to add comment:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const comment = await db.taskComment.findUnique({ where: { id: commentId } });
    if (!comment) return { success: false, error: "Comment not found" };

    const isOwner = comment.author_id === (user.employee_id || user.uid);
    const isAdminOrHR = user.role === "admin" || user.role === "hr";

    if (!isOwner && !isAdminOrHR) {
      return { success: false, error: "You can only delete your own comments" };
    }

    // Soft delete
    await db.taskComment.update({
      where: { id: commentId },
      data: { is_deleted: true },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete comment:", error);
    return { success: false, error: error.message };
  }
}
