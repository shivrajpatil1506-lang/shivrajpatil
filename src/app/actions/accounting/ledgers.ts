"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLedgers(companyId: string) {
  try {
    const ledgers = await prisma.ledger.findMany({
      where: { company_id: companyId, deleted_at: null },
      include: {
        group: {
          select: { name: true, nature: true }
        }
      },
      orderBy: { name: "asc" },
    });
    return { success: true, data: ledgers };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createLedger(companyId: string, data: any) {
  try {
    const ledger = await prisma.ledger.create({
      data: {
        company_id: companyId,
        name: data.name,
        alias: data.alias,
        code: data.code,
        group_id: data.group_id,
        nature: data.nature,
        opening_balance: data.opening_balance || 0,
        opening_balance_type: data.opening_balance_type || null,
        
        is_party: data.is_party || false,
        contact_name: data.contact_name,
        gstin: data.gstin,
        pan: data.pan,
        phone: data.phone,
        email: data.email,
        address_line1: data.address_line1,
        
        bank_name: data.bank_name,
        bank_account_no: data.bank_account_no,
        bank_ifsc: data.bank_ifsc,
        
        track_bill_by_bill: data.track_bill_by_bill || false,
        track_cost_centre: data.track_cost_centre || false,
        is_inventory_affected: data.is_inventory_affected || false,
      },
    });
    
    revalidatePath("/accounting/ledgers");
    return { success: true, data: ledger };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLedger(id: string, data: any) {
  try {
    const existing = await prisma.ledger.findUnique({ where: { id } });
    if (existing?.is_system && existing.name !== data.name) {
      return { success: false, error: "Cannot rename system ledgers." };
    }

    const ledger = await prisma.ledger.update({
      where: { id },
      data: {
        name: data.name,
        alias: data.alias,
        code: data.code,
        group_id: data.group_id,
        nature: data.nature,
        opening_balance: data.opening_balance,
        opening_balance_type: data.opening_balance_type,
        
        is_party: data.is_party,
        contact_name: data.contact_name,
        gstin: data.gstin,
        pan: data.pan,
        phone: data.phone,
        email: data.email,
        address_line1: data.address_line1,
        
        bank_name: data.bank_name,
        bank_account_no: data.bank_account_no,
        bank_ifsc: data.bank_ifsc,
        
        track_bill_by_bill: data.track_bill_by_bill,
        track_cost_centre: data.track_cost_centre,
        is_inventory_affected: data.is_inventory_affected,
      },
    });
    revalidatePath("/accounting/ledgers");
    return { success: true, data: ledger };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLedger(id: string) {
  try {
    const existing = await prisma.ledger.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: { journal_entries: true }
        }
      }
    });

    if (existing?.is_system) {
      return { success: false, error: "Cannot delete system ledgers." };
    }
    
    if (existing?._count.journal_entries && existing._count.journal_entries > 0) {
       return { success: false, error: "Cannot delete ledger with existing transactions." };
    }

    await prisma.ledger.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    revalidatePath("/accounting/ledgers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
