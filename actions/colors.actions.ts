"use server";

import { ActionResult, fail, ok } from "@/lib/actionsType";
import { query } from "@/lib/db";
import { cacheTag } from "next/cache";

export async function getColors({
  userId,
}: {
  userId: string | undefined;
}): Promise<ActionResult<string[]>> {
  "use cache";
  cacheTag("colors");

  try {
    if (!userId) {
      return fail("User doesn't exist");
    }
    
    const primary_color =
      "SELECT user_id, primary_color::text AS color FROM items";
    const secondary_colors =
      "SELECT user_id, UNNEST(secondary_colors)::text AS color FROM items WHERE secondary_colors IS NOT NULL";
    const { rows } = await query(
      `SELECT DISTINCT color 
        FROM (${primary_color} UNION ALL ${secondary_colors}) colors 
        WHERE user_id=$1 
        ORDER BY color`,
      [userId],
    );

    const colors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      colors.push(rows[i].color);
    }

    return ok(colors);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("Failed to fetch colors");
  }
}
