"use server";

import { db } from "@/lib/db";
import { Employee } from "@prisma/client";
import { getRoleFilters } from "@/lib/rbac";
import { unstable_cache, revalidateTag } from "next/cache";

async function fetchEmployees(relatedFilter: any) {
  try {
    const employees = await db.employee.findMany({
      where: { is_deleted: false, ...relatedFilter },
      orderBy: { created_at: "desc" },
      include: {
        company: { select: { short_name: true, name: true } }
      }
    });
    return employees;
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return [];
  }
}

const getCachedEmployees = unstable_cache(
  fetchEmployees,
  ['employees-list'],
  { revalidate: 300, tags: ['employees'] }
);

export async function getEmployees() {
  const { relatedFilter } = await getRoleFilters();
  return getCachedEmployees(relatedFilter);
}

async function fetchAgents(relatedFilter: any) {
  try {
    const agents = await db.employee.findMany({
      where: { portal_role: "agent", is_deleted: false, ...relatedFilter },
      orderBy: { created_at: "desc" },
      include: {
        company: { select: { short_name: true, name: true } }
      }
    });
    return agents;
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return [];
  }
}

const getCachedAgents = unstable_cache(
  fetchAgents,
  ['agents-list'],
  { revalidate: 300, tags: ['employees'] }
);

export async function getAgents() {
  const { relatedFilter } = await getRoleFilters();
  return getCachedAgents(relatedFilter);
}

async function fetchEmployeeWithDetails(id: string) {
  try {
    const employee = await db.employee.findUnique({
      where: { id, is_deleted: false },
      include: {
        company: { select: { short_name: true, name: true } },
        transactions: {
          orderBy: { transaction_date: "desc" }
        }
      }
    });

    if (!employee) return null;

    // Fetch related tasks manually since they aren't directly related in Prisma
    const tasks = await db.task.findMany({
      where: { assigned_to: id },
      take: 5,
      orderBy: { created_at: "desc" }
    });

    // Fetch purchases for this agent
    const purchases = await db.customerPurchase.findMany({
      where: { agent_id: id },
      include: {
        customer: true,
        unit: true,
        site: true
      }
    });

    return {
      ...employee,
      tasks_assigned: tasks,
      sales: purchases
    };
  } catch (error) {
    console.error(`Failed to fetch employee details with id ${id}:`, error);
    return null;
  }
}

export const getEmployeeWithDetails = unstable_cache(
  fetchEmployeeWithDetails,
  ['employee-with-details'],
  { revalidate: 300, tags: ['employees'] }
);

export async function createEmployee(formData: any) {
  try {
    const newEmployee = await db.employee.create({
      data: {
        employee_code: `EMP${Date.now()}`, // Simple mock code generator, in real app might query DB for next seq
        company_id: formData.company_id,
        first_name: formData.first_name,
        middle_name: formData.middle_name || null,
        last_name: formData.last_name,
        dob: formData.dob ? new Date(formData.dob) : null,
        gender: formData.gender || null,
        blood_group: formData.blood_group || null,
        personal_email: formData.personal_email || null,
        work_email: formData.work_email || null,
        personal_mobile: formData.personal_mobile,
        emergency_contact: formData.emergency_contact || null,
        current_address: formData.current_address || null,
        aadhaar_encrypted: formData.aadhaar_encrypted || null,
        pan_number: formData.pan_number || null,
        department: formData.department,
        designation: formData.designation,
        join_date: formData.join_date ? new Date(formData.join_date) : new Date(),
        employment_type: formData.employment_type || "full_time",
        gross_salary: formData.gross_salary ? parseFloat(formData.gross_salary) : null,
        portal_role: formData.portal_role || "agent",
        status: "active",
      }
    });
    revalidateTag('employees', 'default');
    return { success: true, employee: newEmployee };
  } catch (error: any) {
    console.error("Failed to create employee:", error);
    return { success: false, error: error.message };
  }
}

export async function updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
  const updated = await db.employee.update({
    where: { id },
    data: data as any,
  });
  revalidateTag('employees', 'default');
  return updated;
}

export async function deleteEmployee(id: string) {
  try {
    await db.employee.update({
      where: { id },
      data: { is_deleted: true, status: "inactive" }
    });
    revalidateTag('employees', 'default');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete employee:", error);
    return { success: false, error: error.message };
  }
}
