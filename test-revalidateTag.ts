import { revalidateTag } from "next/cache";

try {
  // @ts-ignore
  revalidateTag("flat-map", "default");
  console.log("Success");
} catch (e) {
  console.error("Error:", e);
}
