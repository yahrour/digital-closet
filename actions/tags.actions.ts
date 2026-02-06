"use server";

import { ActionResult, fail, ok } from "@/lib/actionsType";
import { query } from "@/lib/db";
import { cacheTag } from "next/cache";

export async function getTags({
  userId,
}: {
  userId: string | undefined;
}): Promise<ActionResult<string[]>> {
  "use cache";
  cacheTag("tags");

  if (!userId) {
    return fail("User does not exist");
  }

  try {
    const { rows } = await query("SELECT name FROM tags WHERE user_id=$1", [
      userId,
    ]);

    const tags: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      tags.push(rows[i].name);
    }

    return ok(tags);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("Failed to fetch tags");
  }
}
