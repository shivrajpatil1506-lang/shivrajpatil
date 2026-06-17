import { AuthUser } from "@/lib/auth";

/**
 * Returns Prisma where clauses based on the API user's role and company hierarchy.
 * Admins, HRs, and Accountants in the MAIN company get access to all companies.
 * Admins, HRs, and Accountants in SUBSIDIARIES only get access to their subsidiary.
 * Agents only get access to their assigned company.
 */
export function getApiRoleFilters(user: AuthUser | null) {
  if (!user) {
    return { companyFilter: { id: "UNAUTHORIZED" }, relatedFilter: { company_id: "UNAUTHORIZED" } };
  }

  if ((user.role === "admin" || user.role === "hr" || user.role === "accountant") && user.is_main_company) {
    return { companyFilter: {}, relatedFilter: {} };
  }

  return { 
    companyFilter: { id: user.company_id || "MISSING_COMPANY" }, 
    relatedFilter: { company_id: user.company_id || "MISSING_COMPANY" } 
  };
}

/**
 * Helper to check if a user has one of the allowed roles.
 */
export function hasRole(user: AuthUser, allowedRoles: ("admin" | "accountant" | "agent" | "hr")[]) {
  return allowedRoles.includes(user.role);
}
