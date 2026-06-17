"use server";

import { db } from "@/lib/db";
import { Site } from "@prisma/client";
import { getRoleFilters } from "@/lib/rbac";
import { unstable_cache, revalidateTag } from "next/cache";

async function fetchSites(relatedFilter: any) {
  try {
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

const getCachedSites = unstable_cache(
  fetchSites,
  ['sites-list'],
  { revalidate: 300, tags: ['sites'] }
);

export async function getSites() {
  const { relatedFilter } = await getRoleFilters();
  return getCachedSites(relatedFilter);
}

async function fetchSitesByCompanyId(companyId: string): Promise<Site[]> {
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

export const getSitesByCompanyId = unstable_cache(
  fetchSitesByCompanyId,
  ['sites-by-company-id'],
  { revalidate: 300, tags: ['sites'] }
);

async function fetchSiteById(id: string) {
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

export const getSiteById = unstable_cache(
  fetchSiteById,
  ['site-by-id'],
  { revalidate: 300, tags: ['sites'] }
);

async function fetchSiteWithDetails(id: string) {
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

export const getSiteWithDetails = unstable_cache(
  fetchSiteWithDetails,
  ['site-with-details'],
  { revalidate: 300, tags: ['sites'] }
);

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
    revalidateTag('sites', 'default');
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
  revalidateTag('sites', 'default');
  return updated;
}

export async function deleteSite(id: string) {
  try {
    await db.site.update({
      where: { id },
      data: { status: "on_hold" } 
    });
    revalidateTag('sites', 'default');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete site:", error);
    return { success: false, error: error.message };
  }
}
