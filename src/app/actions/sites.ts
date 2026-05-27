"use server";

import { db } from "@/lib/db";
import { Site } from "@prisma/client";
import { getRoleFilters } from "@/lib/rbac";

export async function getSites() {
  try {
    const { relatedFilter } = await getRoleFilters();

    const sites = await db.site.findMany({
      where: { is_deleted: false, ...relatedFilter },
      orderBy: { created_at: "desc" },
      include: {
        company: { select: { name: true, short_name: true } },
        _count: { select: { units: true } },
        units: { select: { status: true } },
      },
    });
    return sites;
  } catch (error) {
    console.error("Failed to fetch sites:", error);
    return [];
  }
}

export async function getSitesByCompanyId(companyId: string): Promise<Site[]> {
  try {
    const sites = await db.site.findMany({
      where: { company_id: companyId, is_deleted: false },
      orderBy: { created_at: "desc" },
    });
    return sites;
  } catch (error) {
    console.error(`Failed to fetch sites for company ${companyId}:`, error);
    return [];
  }
}

export async function getSiteById(id: string) {
  try {
    const site = await db.site.findUnique({
      where: { id, is_deleted: false },
    });
    return site;
  } catch (error) {
    console.error(`Failed to fetch site with id ${id}:`, error);
    return null;
  }
}

export async function getSiteWithDetails(id: string) {
  try {
    const site = await db.site.findUnique({
      where: { id, is_deleted: false },
      include: {
        company: true,
        units: true,
        purchases: {
          include: {
            customer: true,
            unit: true
          }
        }
      }
    });
    return site;
  } catch (error) {
    console.error(`Failed to fetch site details with id ${id}:`, error);
    return null;
  }
}

export async function createSite(formData: any) {
  try {
    const newSite = await db.site.create({
      data: {
        company_id: formData.company_id,
        name: formData.name,
        site_code: formData.site_code,
        site_type: formData.site_type,
        city: formData.city,
        state: formData.state,
        total_land_area: formData.total_land_area,
        land_area_unit: formData.land_area_unit,
        rera_number: formData.rera_number,
        expected_completion: formData.expected_completion,
        status: formData.status,
        description: formData.description,
        property_types: formData.property_types,
        address: formData.address,
        created_by: "system",
      }
    });
    return { success: true, site: newSite };
  } catch (error: any) {
    console.error("Failed to create site:", error);
    return { success: false, error: error.message };
  }
}

export async function updateSite(id: string, data: Partial<Site>) {
  const updated = await db.site.update({
    where: { id },
    data: data as any,
  });
  return updated;
}

export async function deleteSite(id: string) {
  try {
    await db.site.update({
      where: { id },
      data: { status: "on_hold" } // or create is_deleted in DB if needed, but on_hold works as soft-delete
    });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete site:", error);
    return { success: false, error: error.message };
  }
}
