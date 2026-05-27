"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCostCentres(companyId: string) {
  try {
    const centres = await prisma.costCentre.findMany({
      where: { company_id: companyId },
      include: {
        category: true,
      },
      orderBy: { name: "asc" },
    });
    return { success: true, data: centres };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCostCentre(companyId: string, data: any) {
  try {
    const centre = await prisma.costCentre.create({
      data: {
        company_id: companyId,
        name: data.name,
        alias: data.alias,
        code: data.code,
        category_id: data.category_id,
        parent_id: data.parent_id,
      },
    });
    revalidatePath("/accounting/cost-centres");
    return { success: true, data: centre };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
