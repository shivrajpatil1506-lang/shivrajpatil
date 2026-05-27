"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGroups(companyId: string) {
  try {
    const groups = await prisma.accountGroup.findMany({
      where: { company_id: companyId, deleted_at: null },
      orderBy: [{ sequence_no: "asc" }, { name: "asc" }],
    });
    return { success: true, data: groups };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createGroup(companyId: string, data: any) {
  try {
    const group = await prisma.accountGroup.create({
      data: {
        company_id: companyId,
        name: data.name,
        alias: data.alias,
        nature: data.nature,
        parent_id: data.parent_id || null,
        affects_gross_profit: data.affects_gross_profit || false,
        is_primary: !data.parent_id,
        is_system: false,
      },
    });
    revalidatePath("/accounting/groups");
    return { success: true, data: group };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateGroup(id: string, data: any) {
  try {
    const existing = await prisma.accountGroup.findUnique({ where: { id } });
    if (existing?.is_system && existing.name !== data.name) {
      return { success: false, error: "Cannot rename system groups." };
    }

    const group = await prisma.accountGroup.update({
      where: { id },
      data: {
        name: data.name,
        alias: data.alias,
        nature: data.nature,
        parent_id: data.parent_id || null,
        affects_gross_profit: data.affects_gross_profit || false,
      },
    });
    revalidatePath("/accounting/groups");
    return { success: true, data: group };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteGroup(id: string) {
  try {
    const existing = await prisma.accountGroup.findUnique({ where: { id } });
    if (existing?.is_system) {
      return { success: false, error: "Cannot delete system groups." };
    }

    // Soft delete
    await prisma.accountGroup.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    revalidatePath("/accounting/groups");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAccountGroups(companyId: string) {
  try {
    const groups = await prisma.accountGroup.findMany({
      where: { company_id: companyId, deleted_at: null },
      orderBy: [{ sequence_no: "asc" }, { name: "asc" }],
    });

    const flat = groups;
    const treeMap = new Map();
    flat.forEach(g => treeMap.set(g.id, { ...g, children: [] }));
    const tree: any[] = [];
    treeMap.forEach(g => {
      if (g.parent_id) {
        if (treeMap.has(g.parent_id)) treeMap.get(g.parent_id).children.push(g);
      } else {
        tree.push(g);
      }
    });

    return { success: true, data: { tree, flat } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
