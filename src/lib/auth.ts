import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { db } from "@/lib/db";
import { cache } from "react";

export type AuthUser = {
  uid: string;
  email: string;
  role: "admin" | "agent" | "accountant" | "hr";
  employee_id: string | null;
  company_id: string | null;
  is_main_company: boolean;
  name: string;
};

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    // Verify session
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, false);
    
    if (!decodedClaims.email) return null;

    // Hardcoded Backdoor for Root Admin (Option B)
    if (decodedClaims.email === "shivraj@admin.com") {
      // Check if root admin has an actual employee profile
      const rootEmployee = await db.employee.findFirst({
        where: { auth_uid: decodedClaims.uid, is_deleted: false }
      });
      
      if (rootEmployee) {
        const company = await db.company.findUnique({ where: { id: rootEmployee.company_id }});
        return {
          uid: decodedClaims.uid,
          email: decodedClaims.email,
          role: "admin",
          employee_id: rootEmployee.id,
          company_id: rootEmployee.company_id,
          is_main_company: company?.is_main_company || true,
          name: [rootEmployee.first_name, rootEmployee.last_name].filter(Boolean).join(" ")
        };
      }

      // If no employee profile yet, grant full bypass
      return {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        role: "admin",
        employee_id: null,
        company_id: null,
        is_main_company: true, // Super Admin bypasses company filter
        name: "Super Admin"
      };
    }

    // Fast Lookup: Find Employee by auth_uid directly
    let employee = await db.employee.findFirst({
      where: { 
        auth_uid: decodedClaims.uid,
        is_deleted: false,
        status: "active"
      },
      include: {
        company: { select: { is_main_company: true } }
      }
    });

    // Fallback: Just in case an existing user logs in and hasn't had their auth_uid linked yet
    if (!employee) {
      employee = await db.employee.findFirst({
        where: { 
          OR: [
            { work_email: { equals: decodedClaims.email, mode: "insensitive" } },
            { personal_email: { equals: decodedClaims.email, mode: "insensitive" } }
          ],
          is_deleted: false,
          status: "active"
        },
        include: {
          company: { select: { is_main_company: true } }
        }
      });

      // Automatically link auth_uid for future fast logins
      if (employee && !employee.auth_uid) {
        await db.employee.update({
          where: { id: employee.id },
          data: { auth_uid: decodedClaims.uid }
        });
      }
    }

    if (employee) {
      return {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        role: (employee.portal_role || "agent") as any,
        employee_id: employee.id,
        company_id: employee.company_id,
        is_main_company: employee.company?.is_main_company || false,
        name: [employee.first_name, employee.last_name].filter(Boolean).join(" ")
      };
    }

    // If they aren't the super admin AND they aren't in the Employee table, they are unauthorized.
    return null;

  } catch (error) {
    console.error("Auth verification failed:", error);
    return null;
  }
});
