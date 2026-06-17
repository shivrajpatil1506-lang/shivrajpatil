"use server";

import { revalidateTag } from "next/cache";

/**
 * Triggers a revalidation of all queries tagged with 'dashboard'.
 * Used when a user logs in to ensure fresh data is loaded, overriding the 5-minute cache.
 */
export async function refreshDashboardCache() {
  revalidateTag("dashboard");
}
