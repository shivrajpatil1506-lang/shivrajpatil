"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCurrencies(companyId: string) {
  try {
    const currencies = await prisma.currency.findMany({
      where: { company_id: companyId },
      orderBy: { code: "asc" },
    });
    return { success: true, data: currencies };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCurrency(companyId: string, data: { code: string, name: string, symbol?: string, decimal_places?: number }) {
  try {
    const currency = await prisma.currency.create({
      data: {
        company_id: companyId,
        code: data.code,
        name: data.name,
        symbol: data.symbol,
        decimal_places: data.decimal_places || 2,
      },
    });
    return { success: true, data: currency };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
