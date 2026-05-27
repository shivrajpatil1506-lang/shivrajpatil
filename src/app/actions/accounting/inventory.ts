"use server";

import prisma from "@/lib/prisma";

export async function createStockGroup(companyId: string, data: { name: string, parent_id?: string, is_addable?: boolean }) {
  try {
    const group = await prisma.stockGroup.create({
      data: {
        company_id: companyId,
        name: data.name,
        parent_id: data.parent_id,
        is_addable: data.is_addable ?? true,
      }
    });
    return { success: true, data: group };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createUnitOfMeasure(companyId: string, data: { symbol: string, formal_name?: string, decimal_places?: number }) {
  try {
    const uom = await prisma.unitOfMeasure.create({
      data: {
        company_id: companyId,
        symbol: data.symbol,
        formal_name: data.formal_name,
        decimal_places: data.decimal_places ?? 0,
      }
    });
    return { success: true, data: uom };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createStockItem(companyId: string, data: { 
  name: string, 
  group_id?: string, 
  base_unit_id: string,
  costing_method?: string,
  gst_applicable?: boolean,
  gst_rate?: number 
}) {
  try {
    const item = await prisma.stockItem.create({
      data: {
        company_id: companyId,
        name: data.name,
        group_id: data.group_id,
        base_unit_id: data.base_unit_id,
        costing_method: data.costing_method || 'FIFO',
        gst_applicable: data.gst_applicable ?? true,
        gst_rate: data.gst_rate ? Number(data.gst_rate) : null,
      }
    });
    return { success: true, data: item };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
