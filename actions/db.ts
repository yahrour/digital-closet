import { query } from "@/lib/db";
import { cacheTag } from "next/cache";

export async function getColors() {
  "use cache";
  cacheTag("colors");

  try {
    const { rows } = await query(
      "SELECT primary_color, secondary_color FROM garments",
    );
    const colors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      if (!colors.includes(rows[i].primary_color)) {
        colors.push(rows[i].primary_color);
      }
      for (let j = 0; j < rows[i].secondary_color.length; j++) {
        if (!colors.includes(rows[i].secondary_color[j])) {
          colors.push(rows[i].secondary_color[j]);
        }
      }
    }

    return colors;
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return null;
  }
}
