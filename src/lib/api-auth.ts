import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { db } from "@/lib/db";
import { AuthUser } from "@/lib/auth";

/**
 * Extracts and verifies the Firebase ID token from the Authorization header.
 * Returns the AuthUser object or null if unauthorized.
 */
export async function getApiUser(req: NextRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // Verify the ID token (not the session cookie)
    const decodedClaims = await adminAuth.verifyIdToken(idToken, true);
    
    if (!decodedClaims.email) return null;

    // Hardcoded Backdoor for Root Admin (Same as web app)
    if (decodedClaims.email === "shivraj@admin.com") {
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

      return {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        role: "admin",
        employee_id: null,
        company_id: null,
        is_main_company: true,
        name: "Super Admin"
      };
    }

    // Fast Lookup: Find Employee by auth_uid
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

    return null;

  } catch (error) {
    console.error("API Auth verification failed:", error);
    return null;
  }
}
