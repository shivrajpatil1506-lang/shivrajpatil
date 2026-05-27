"use server";

import { db } from "@/lib/db";

export async function getApprovals() {
  try {
    const approvals = await db.approvalRequest.findMany({
      orderBy: { requested_at: 'desc' }
    });
    
    // In a real app we'd fetch the user's name or mock it if not available
    return approvals.map((a: any) => ({
      ...a,
      requested_by_name: a.requested_by || "Unknown User",
      reviewed_by_name: a.reviewed_by || null,
    }));
  } catch (error) {
    console.error("Failed to fetch approvals:", error);
    return [];
  }
}

export async function getApprovalById(id: string) {
  try {
    const approval = await db.approvalRequest.findUnique({
      where: { id }
    });
    if (!approval) return null;
    
    return {
      ...approval,
      requested_by_name: approval.requested_by || "Unknown User",
      reviewed_by_name: approval.reviewed_by || null,
    };
  } catch (error) {
    console.error("Failed to fetch approval:", error);
    return null;
  }
}

export async function updateApprovalStatus(id: string, status: string, notes?: string) {
  try {
    const approval = await db.approvalRequest.update({
      where: { id },
      data: {
        status,
        review_notes: notes || null,
        reviewed_at: new Date(),
        reviewed_by: "current-admin-id", // Placeholder for authenticated user
      }
    });
    return { success: true, approval };
  } catch (error: any) {
    console.error("Failed to update approval:", error);
    return { success: false, error: error.message };
  }
}
