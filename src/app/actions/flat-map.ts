"use server";

import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type FlatMapData = Awaited<ReturnType<typeof getFlatMapData>>;

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Fetches the complete Flat Map state for a site:
 * FlatTypes + Blocks → Floors → Flats (with FlatType info).
 * Seeds default FlatTypes (1BHK/2BHK/3BHK) on first load.
 */
export async function getFlatMapData(siteId: string) {
  try {
    // Seed default flat types if none exist for this site
    const existingTypes = await db.flatType.count({ where: { site_id: siteId } });
    if (existingTypes === 0) {
      await db.flatType.createMany({
        data: [
          { site_id: siteId, name: "1BHK", default_carpet_area: 450, default_loading_pct: 20, color_tag: "#6366F1", is_system_default: true },
          { site_id: siteId, name: "2BHK", default_carpet_area: 650, default_loading_pct: 20, color_tag: "#0EA5E9", is_system_default: true },
          { site_id: siteId, name: "3BHK", default_carpet_area: 900, default_loading_pct: 20, color_tag: "#10B981", is_system_default: true },
        ],
        skipDuplicates: true,
      });
    }

    // Seed default block if none exists for this site
    const existingBlocksCount = await db.block.count({ where: { site_id: siteId } });
    if (existingBlocksCount === 0) {
      await db.block.create({
        data: {
          site_id: siteId,
          name: "Block A",
          default_category: "new",
          rate_new: 0,
          rate_redev: 0,
          sort_index: 0,
        },
      });
    }

    const [flatTypes, blocks] = await Promise.all([
      db.flatType.findMany({
        where: { site_id: siteId },
        orderBy: [{ is_system_default: "desc" }, { name: "asc" }],
      }),
      db.block.findMany({
        where: { site_id: siteId },
        orderBy: { sort_index: "asc" },
        include: {
          floors: {
            orderBy: { sort_index: "desc" }, // highest floor first
            include: {
              flats: {
                orderBy: { no: "asc" },
                include: { 
                  flat_type: true,
                  customer: { select: { id: true, first_name: true, last_name: true } }
                },
              },
            },
          },
        },
      }),
    ]);

    return { flatTypes, blocks };
  } catch (error) {
    console.error("getFlatMapData error:", error);
    return { flatTypes: [], blocks: [] };
  }
}

// ─────────────────────────────────────────────
// FLAT TYPE CRUD
// ─────────────────────────────────────────────

export async function createFlatType(
  siteId: string,
  data: { name: string; default_carpet_area: number; default_loading_pct: number; color_tag?: string }
) {
  try {
    const ft = await db.flatType.create({
      data: { site_id: siteId, ...data },
    });
    revalidateTag("flat-map", "default");
    return { success: true, flatType: ft };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: `A flat type named "${data.name}" already exists for this site.` };
    }
    console.error("createFlatType error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateFlatType(
  id: string,
  data: { name?: string; default_carpet_area?: number; default_loading_pct?: number; color_tag?: string }
) {
  try {
    const ft = await db.flatType.update({ where: { id }, data });
    revalidateTag("flat-map", "default");
    return { success: true, flatType: ft };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: `A flat type with that name already exists.` };
    }
    console.error("updateFlatType error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Deletes a FlatType. Blocked if any Flat references it.
 */
export async function deleteFlatType(id: string) {
  try {
    const usageCount = await db.flat.count({ where: { flat_type_id: id } });
    if (usageCount > 0) {
      return {
        success: false,
        error: `Cannot delete: ${usageCount} flat${usageCount > 1 ? "s" : ""} use this type. Update or remove those flats first.`,
      };
    }
    await db.flatType.delete({ where: { id } });
    revalidateTag("flat-map", "default");
    return { success: true };
  } catch (error: any) {
    console.error("deleteFlatType error:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// BLOCK CRUD
// ─────────────────────────────────────────────

export async function createBlock(
  siteId: string,
  data: { name: string; default_category: "new" | "redev"; rate_new: number; rate_redev: number }
) {
  try {
    // Sort index = count of existing blocks (append at end)
    const count = await db.block.count({ where: { site_id: siteId } });
    const block = await db.block.create({
      data: { site_id: siteId, sort_index: count, ...data },
      include: { floors: { include: { flats: { include: { flat_type: true } } } } },
    });
    revalidateTag("flat-map", "default");
    return { success: true, block };
  } catch (error: any) {
    console.error("createBlock error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBlock(
  id: string,
  data: { name?: string; default_category?: "new" | "redev"; rate_new?: number; rate_redev?: number }
) {
  try {
    const block = await db.block.update({ where: { id }, data });
    revalidateTag("flat-map", "default");
    return { success: true, block };
  } catch (error: any) {
    console.error("updateBlock error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Deletes a Block and cascades to all its Floors and Flats.
 */
export async function deleteBlock(id: string) {
  try {
    await db.block.delete({ where: { id } });
    revalidateTag("flat-map", "default");
    return { success: true };
  } catch (error: any) {
    console.error("deleteBlock error:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// FLOOR CRUD
// ─────────────────────────────────────────────

export async function createFloor(blockId: string, data: { label: string }) {
  try {
    const count = await db.floor.count({ where: { block_id: blockId } });
    const floor = await db.floor.create({
      data: { block_id: blockId, sort_index: count, ...data },
      include: { flats: { include: { flat_type: true } } },
    });
    revalidateTag("flat-map", "default");
    return { success: true, floor };
  } catch (error: any) {
    console.error("createFloor error:", error);
    return { success: false, error: error.message };
  }
}

export async function bulkCreateFloors(blockId: string, count: number, startNumber: number) {
  try {
    const lastFloor = await db.floor.findFirst({
      where: { block_id: blockId },
      orderBy: { sort_index: "desc" },
    });
    const nextSortIndex = lastFloor ? lastFloor.sort_index + 1 : 0;

    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        block_id: blockId,
        label: `Floor ${startNumber + i}`,
        sort_index: nextSortIndex + i,
      });
    }

    await db.floor.createMany({ data });
    revalidateTag("flat-map", "default");
    return { success: true };
  } catch (error: any) {
    console.error("bulkCreateFloors error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateFloor(id: string, data: { label?: string; sort_index?: number }) {
  try {
    const floor = await db.floor.update({ where: { id }, data });
    revalidateTag("flat-map", "default");
    return { success: true, floor };
  } catch (error: any) {
    console.error("updateFloor error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteFloor(id: string) {
  try {
    await db.floor.delete({ where: { id } });
    revalidateTag("flat-map", "default");
    return { success: true };
  } catch (error: any) {
    console.error("deleteFloor error:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// FLAT — BULK CREATE
// ─────────────────────────────────────────────

type BulkCreateBatch = {
  flat_type_id: string | null;
  category: "new" | "redev";
  carpet_area: number;
  loading_pct: number;
  sale_area: number;
  sale_area_overridden: boolean;
  count: number;
  starting_no: string; // e.g. "601" or "6A" or "P-1"
};

/**
 * Auto-increments the trailing numeric portion of a flat number string.
 * E.g.: "601" → "602", "6A-1" → "6A-2", "Penthouse" → "Penthouse-2"
 */
function incrementFlatNo(base: string, step: number): string {
  // Match trailing digits
  const match = base.match(/^(.*?)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const num = parseInt(match[2], 10);
    const padded = String(num + step).padStart(match[2].length, "0");
    return `${prefix}${padded}`;
  }
  // No trailing digit found — append numeric suffix
  return `${base}-${step + 1}`;
}

/**
 * Generates the sequence of flat numbers for a batch.
 */
function generateFlatNumbers(startingNo: string, count: number): string[] {
  const numbers: string[] = [startingNo];
  for (let i = 1; i < count; i++) {
    numbers.push(incrementFlatNo(startingNo, i));
  }
  return numbers;
}

/**
 * Bulk-creates N flats on a floor.
 * Validates uniqueness within the Block before inserting.
 * Returns conflicts if any are found (does NOT partially insert).
 */
export async function bulkCreateFlats(floorId: string, batch: BulkCreateBatch) {
  try {
    // Get block_id via floor
    const floor = await db.floor.findUnique({
      where: { id: floorId },
      select: { block_id: true },
    });
    if (!floor) return { success: false, error: "Floor not found." };

    // Generate numbers for this batch
    const generatedNos = generateFlatNumbers(batch.starting_no, batch.count);

    // Fetch all existing flat numbers in this Block
    const existingFlats = await db.flat.findMany({
      where: {
        floor: { block_id: floor.block_id },
      },
      select: { no: true },
    });
    const existingSet = new Set(existingFlats.map((f) => f.no));

    // Check for conflicts
    const conflicts = generatedNos.filter((no) => existingSet.has(no));
    if (conflicts.length > 0) {
      return {
        success: false,
        error: `Flat number${conflicts.length > 1 ? "s" : ""} already exist in this Block: ${conflicts.join(", ")}. Adjust the starting number.`,
        conflicts,
      };
    }

    // Create all flats in a transaction
    await db.$transaction(
      generatedNos.map((no) =>
        db.flat.create({
          data: {
            floor_id: floorId,
            flat_type_id: batch.flat_type_id,
            no,
            category: batch.category,
            carpet_area: batch.carpet_area,
            loading_pct: batch.loading_pct,
            sale_area: batch.sale_area,
            sale_area_overridden: batch.sale_area_overridden,
            status: "unsold",
          },
        })
      )
    );

    revalidateTag("flat-map", "default");
    return { success: true, created: generatedNos.length, numbers: generatedNos };
  } catch (error: any) {
    console.error("bulkCreateFlats error:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// FLAT — SINGLE EDIT / DELETE
// ─────────────────────────────────────────────

export async function updateFlat(
  id: string,
  data: {
    flat_type_id?: string | null;
    no?: string;
    category?: "new" | "redev";
    status?: "unsold" | "booked" | "hold" | "sold";
    carpet_area?: number;
    loading_pct?: number;
    sale_area?: number;
    sale_area_overridden?: boolean;
    facing?: string | null;
    notes?: string | null;
    customer_id?: string | null;
  }
) {
  try {
    // If flat number is changing, check uniqueness within Block
    if (data.no !== undefined) {
      const flat = await db.flat.findUnique({
        where: { id },
        select: { floor: { select: { block_id: true } }, no: true },
      });
      if (flat && data.no !== flat.no) {
        const conflict = await db.flat.findFirst({
          where: {
            no: data.no,
            floor: { block_id: flat.floor.block_id },
            id: { not: id },
          },
        });
        if (conflict) {
          return { success: false, error: `Flat number "${data.no}" already exists in this Block.` };
        }
      }
    }

    const updated = await db.flat.update({ where: { id }, data });
    revalidateTag("flat-map", "default");
    return { success: true, flat: updated };
  } catch (error: any) {
    console.error("updateFlat error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteFlat(id: string) {
  try {
    await db.flat.delete({ where: { id } });
    revalidateTag("flat-map", "default");
    return { success: true };
  } catch (error: any) {
    console.error("deleteFlat error:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// COPY FLOOR TO OTHER FLOORS
// ─────────────────────────────────────────────

/**
 * Copies the flat composition of a source floor to one or more target floors.
 * Flat numbers are offset: the trailing numeric portion is replaced based on
 * the target floor's sort_index. Conflicts on target floors are skipped with a warning.
 */
export async function copyFloorToFloors(sourceFloorId: string, targetFloorIds: string[]) {
  try {
    const sourceFloor = await db.floor.findUnique({
      where: { id: sourceFloorId },
      include: {
        flats: true,
        block: { select: { id: true } },
      },
    });
    if (!sourceFloor) return { success: false, error: "Source floor not found." };
    if (sourceFloor.flats.length === 0) return { success: false, error: "Source floor has no flats to copy." };

    const results: { floorId: string; created: number; skipped: string[] }[] = [];

    for (const targetFloorId of targetFloorIds) {
      if (targetFloorId === sourceFloorId) continue;

      const targetFloor = await db.floor.findUnique({
        where: { id: targetFloorId },
        select: { id: true, sort_index: true, block_id: true },
      });
      if (!targetFloor || targetFloor.block_id !== sourceFloor.block_id) continue;

      // Get existing flat numbers in the target block for collision detection
      const existingFlats = await db.flat.findMany({
        where: { floor: { block_id: sourceFloor.block_id } },
        select: { no: true },
      });
      const existingSet = new Set(existingFlats.map((f) => f.no));

      // Derive target flat numbers: replace leading numeric group with target floor's sort_index + 1
      const floorNum = targetFloor.sort_index + 1;
      const skipped: string[] = [];
      let created = 0;

      for (const flat of sourceFloor.flats) {
        // Replace leading numeric group in flat number with target floor number
        const derivedNo = flat.no.replace(/^(\d+)/, String(floorNum));

        if (existingSet.has(derivedNo)) {
          skipped.push(flat.no);
          continue;
        }

        existingSet.add(derivedNo); // prevent intra-batch collisions
        await db.flat.create({
          data: {
            floor_id: targetFloorId,
            flat_type_id: flat.flat_type_id,
            no: derivedNo,
            category: flat.category,
            carpet_area: flat.carpet_area,
            loading_pct: flat.loading_pct,
            sale_area: flat.sale_area,
            sale_area_overridden: flat.sale_area_overridden,
            facing: flat.facing,
            notes: flat.notes,
            status: "unsold", // reset status on copy
          },
        });
        created++;
      }

      results.push({ floorId: targetFloorId, created, skipped });
    }

    revalidateTag("flat-map", "default");
    return { success: true, results };
  } catch (error: any) {
    console.error("copyFloorToFloors error:", error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// CSV EXPORT
// ─────────────────────────────────────────────

/**
 * Returns a CSV string with all flat data for the site.
 * Columns: Block, Floor, Flat No, Flat Type, Category, Status,
 *          Carpet Area, Loading %, Sale Area, Rate Applied, Value, Facing, Notes
 */
export async function exportFlatMapCSV(siteId: string): Promise<{ success: boolean; csv?: string; error?: string }> {
  try {
    const blocks = await db.block.findMany({
      where: { site_id: siteId },
      orderBy: { sort_index: "asc" },
      include: {
        floors: {
          orderBy: { sort_index: "asc" },
          include: {
            flats: {
              orderBy: { no: "asc" },
              include: { flat_type: true },
            },
          },
        },
      },
    });

    const header = [
      "Block", "Floor", "Flat No", "Flat Type", "Category", "Status",
      "Carpet Area (sqft)", "Loading %", "Sale Area (sqft)", "Rate (₹/sqft)", "Value (₹)",
      "Facing", "Notes",
    ].join(",");

    const rows: string[] = [header];

    for (const block of blocks) {
      for (const floor of block.floors) {
        for (const flat of floor.flats) {
          const rate = flat.category === "redev" ? block.rate_redev : block.rate_new;
          const value = flat.sale_area * rate;
          const row = [
            `"${block.name}"`,
            `"${floor.label}"`,
            `"${flat.no}"`,
            `"${flat.flat_type?.name || "Unclassified"}"`,
            flat.category === "new" ? "New" : "Redeveloped",
            flat.status.charAt(0).toUpperCase() + flat.status.slice(1),
            flat.carpet_area,
            flat.loading_pct,
            flat.sale_area,
            rate,
            value.toFixed(0),
            `"${flat.facing || ""}"`,
            `"${flat.notes || ""}"`,
          ].join(",");
          rows.push(row);
        }
      }
    }

    return { success: true, csv: rows.join("\n") };
  } catch (error: any) {
    console.error("exportFlatMapCSV error:", error);
    return { success: false, error: error.message };
  }
}
