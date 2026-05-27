"use server";

import { db } from "@/lib/db";

export async function getNotifications() {
  try {
    const notifications = await db.notification.findMany({
      orderBy: { created_at: 'desc' },
      take: 10
    });
    return notifications;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function markNotificationRead(id: string) {
  try {
    await db.notification.update({
      where: { id },
      data: { is_read: true }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
