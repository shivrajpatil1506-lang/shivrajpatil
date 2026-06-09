"use server";

import { db } from "@/lib/db";
import { Company } from "@prisma/client";
import { getRoleFilters } from "@/lib/rbac";
import { unstable_cache, revalidateTag } from "next/cache";

async function fetchCompanies(companyFilter: any) {
  try {
    const companies = await db.company.findMany({
      where: { is_deleted: false, ...companyFilter },
      orderBy: { created_at: "desc" },
      include: {
        _count: {
          select: { sites: true, employees: true },
        },
      },
    });
    return companies;
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return [];
  }
}

const getCachedCompanies = unstable_cache(
  fetchCompanies,
  ['companies-list'],
  { revalidate: 300, tags: ['companies'] }
);

export async function getCompanies() {
  const { companyFilter } = await getRoleFilters();
  return getCachedCompanies(companyFilter);
}

async function fetchCompanyById(id: string) {
  try {
    const company = await db.company.findUnique({
      where: { id, is_deleted: false },
    });
    return company;
  } catch (error) {
    console.error(`Failed to fetch company with id ${id}:`, error);
    return null;
  }
}

export const getCompanyById = unstable_cache(
  fetchCompanyById,
  ['company-by-id'],
  { revalidate: 300, tags: ['companies'] }
);

async function fetchCompanyWithDetails(id: string) {
  try {
    const company = await db.company.findUnique({
      where: { id, is_deleted: false },
      include: {
        sites: {
          include: {
            _count: { select: { units: true } },
            units: { select: { status: true } }
          }
        },
        employees: true,
        transactions: {
          orderBy: { transaction_date: 'desc' }
        }
      }
    });
    return company;
  } catch (error) {
    console.error(`Failed to fetch company details with id ${id}:`, error);
    return null;
  }
}

export const getCompanyWithDetails = unstable_cache(
  fetchCompanyWithDetails,
  ['company-with-details'],
  { revalidate: 300, tags: ['companies'] }
);

export async function createCompany(formData: any) {
  try {
    const newCompany = await db.company.create({
      data: {
        name: formData.name,
        short_name: formData.short_name,
        cin: formData.cin,
        gstin: formData.gstin,
        pan: formData.pan,
        email: formData.email,
        phone_numbers: formData.phone,
        website: formData.website || null,
        incorporated_at: formData.incorporated_at ? new Date(formData.incorporated_at) : null,
        status: formData.status || "active",
        notes: formData.notes || null,
        is_main_company: formData.is_main_company === true || formData.is_main_company === "true",
        reg_address: {
          line1: formData.address_line1,
          address_line2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          pin: formData.pin,
        },
        created_by: "system", // Would be from user session
      }
    });
    revalidateTag('companies');
    return { success: true, company: newCompany };
  } catch (error: any) {
    console.error("Failed to create company:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCompany(id: string, data: Partial<Company>) {
  const updated = await db.company.update({
    where: { id },
    data: data as any,
  });
  revalidateTag('companies');
  return updated;
}

export async function deleteCompany(id: string) {
  try {
    await db.company.update({
      where: { id },
      data: { status: "inactive" }
    });
    revalidateTag('companies');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete company:", error);
    return { success: false, error: error.message };
  }
}
