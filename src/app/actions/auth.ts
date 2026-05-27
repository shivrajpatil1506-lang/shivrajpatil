"use server";

import { db } from "@/lib/db";

/**
 * Validates if an email exists in the Employee database and links it to the Firebase UID.
 */
export async function linkAuthUserToEmployee(uid: string, email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    const employee = await db.employee.findFirst({
      where: { 
        OR: [
          { work_email: { equals: normalizedEmail, mode: "insensitive" } },
          { personal_email: { equals: normalizedEmail, mode: "insensitive" } }
        ],
        is_deleted: false,
        status: "active"
      }
    });

    if (!employee) {
      return { success: false, error: "You must be invited by an Administrator before creating an account." };
    }

    if (employee.auth_uid && employee.auth_uid !== uid) {
      return { success: false, error: "This email is already linked to another account." };
    }

    await db.employee.update({
      where: { id: employee.id },
      data: { auth_uid: uid }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to link auth user:", error);
    return { success: false, error: "Internal server error" };
  }
}
