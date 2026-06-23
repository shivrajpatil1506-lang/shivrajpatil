import { getFlatMapData } from "./src/app/actions/flat-map";

async function main() {
  try {
    // We need a site ID to query. Let's get the first site.
    const { db } = require("./src/lib/db");
    const site = await db.site.findFirst();
    if (!site) {
      console.log("No sites found");
      return;
    }
    console.log("Fetching FlatMapData for site:", site.id);
    const data = await getFlatMapData(site.id);
    console.log("Blocks:", data.blocks.length);
    if (data.blocks.length > 0) {
      console.log("Floors in first block:", data.blocks[0].floors?.length);
      if (data.blocks[0].floors?.length > 0) {
        console.log("Flats in first floor:", data.blocks[0].floors[0].flats?.length);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

main();
