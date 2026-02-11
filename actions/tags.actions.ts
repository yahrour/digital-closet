"use server";

import { ActionResult, fail, ok } from "@/lib/actionsType";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { cacheTag, updateTag } from "next/cache";

export async function getTags({
  userId,
}: {
  userId: string | undefined;
}): Promise<ActionResult<string[]>> {
  "use cache";
  cacheTag("tags");

  try {
    if (!userId) {
      return fail("User doesn't exist");
    }

    const { rows } = await query("SELECT name FROM tags WHERE user_id=$1", [
      userId,
    ]);

    const tags: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      tags.push(rows[i].name);
    }

    return ok(tags);
  } catch (error) {
    console.log("db error: ", error);
    return fail("Failed to fetch tags");
  }
}

export async function getUnusedTags({
  userId,
}: {
  userId: string;
}): Promise<ActionResult<string[]>> {
  try {
    if (!userId) {
      return fail("User doesn't exist");
    }

    const { rows } = await query(
      `SELECT t.name FROM tags t LEFT JOIN item_tags it ON t.id=it.tag_id WHERE it.tag_id IS NULL AND t.user_id=$1`,
      [userId]
    );

    const tags: string[] = rows.map((tag) => tag.name);

    return ok(tags);
  } catch (error) {
    console.log("db error: ", error);
    return fail("Failed to fetch unused tags");
  }
}

export async function deleteUnusedTags() {
  try {
    return withAuth(deleteUnusedTagsHandler, {});
  } catch {
    return fail("Unauthorized");
  }
}

async function deleteUnusedTagsHandler({
  userId,
}: {
  userId: string;
}): Promise<ActionResult<null>> {
  try {
    if (!userId) {
      return fail("User doesn't exist");
    }

    const { rows } = await query(
      `SELECT t.id FROM tags t LEFT JOIN item_tags it ON t.id=it.tag_id WHERE it.tag_id IS NULL AND t.user_id=$1`,
      [userId]
    );

    const unusedTagIds: string[] = rows.map((row) => row.id);

    await query("DELETE FROM tags WHERE id=ANY($1)", [unusedTagIds]);

    updateTag("tags");
    return ok(null);
  } catch {
    return fail("Failed to delete unused tags");
  }
}
