import { query } from "@/lib/db";
import { cacheTag } from "next/cache";

export async function getColors({ user_id }: { user_id: string | undefined }) {
  "use cache";
  cacheTag("colors");

  if (!user_id) {
    return null;
  }

  try {
    const { rows } = await query(
      "SELECT primary_color, secondary_colors::text[] AS secondary_colors FROM garments WHERE user_id=$1",
      [user_id],
    );

    const colors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      if (!colors.includes(rows[i].primary_color)) {
        colors.push(rows[i].primary_color);
      }
      for (let j = 0; j < rows[i].secondary_colors.length; j++) {
        if (!colors.includes(rows[i].secondary_colors[j])) {
          colors.push(rows[i].secondary_colors[j]);
        }
      }
    }

    return colors;
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return null;
  }
}
