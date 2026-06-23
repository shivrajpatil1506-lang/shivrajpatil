import { db } from "./src/lib/db";

async function main() {
  try {
    const blocks = await db.block.findMany({ include: { floors: { include: { flats: true } } } });
    for (const b of blocks) {
      const flatsCount = b.floors.reduce((acc, f) => acc + f.flats.length, 0);
      console.log(`Block: ${b.name} | Site: ${b.site_id} | Floors: ${b.floors.length} | Flats: ${flatsCount}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await db.$disconnect();
  }
}

main();
