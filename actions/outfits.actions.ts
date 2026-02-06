"use server";

import { newOutfitSchemaType } from "@/components/Outfits/New/CreateOutfitDialog";
import { ActionResult, fail, ok } from "@/lib/actionsType";
import { query } from "@/lib/db";
import { newOutfitSchema, updateOutfitSchema } from "@/schemas";
import { generateItemImageUrls } from "./images.actions";
import { cacheTag, updateTag } from "next/cache";
import z from "zod";
import { DEFAULT_PAGE_LIMIT } from "@/constants";

export async function createNewOutfit({
  formData,
  userId,
}: {
  formData: newOutfitSchemaType;
  userId: string;
}): Promise<ActionResult<null>> {
  try {
    const { data, success, error } = newOutfitSchema.safeParse(formData);
    if (!success) {
      console.log("error: ", error);
      return fail("INVALUD_INPUT", "Something went wrong !");
    }

    await query("BEGIN");

    const { rows } = await query(
      "INSERT INTO outfits (user_id, name, note) VALUES ($1, $2, $3) RETURNING id",
      [userId, data.name, data.note],
    );
    const outfitId = rows[0].id;

    await query(
      "INSERT INTO outfit_items (outfit_id, item_id) SELECT $1, itemId FROM unnest($2::int[]) AS itemId ON CONFLICT DO NOTHING",
      [outfitId, data.selectedItemIds],
    );

    await query("COMMIT");
    updateTag("outfits");
    return ok(null);
  } catch (error) {
    await query("ROLLBACK");
    console.log("[ERROR] db error: ", error);
    return fail("DB_ERROR", "Failed to create outfit");
  }
}

export type outfit = {
  id: number;
  name: string;
  note: string;
  item_ids: number[];
  items: string[];
  primary_image_keys: string[];
  total?: string;
};

export async function getOutfits({
  userId,
  page,
}: {
  userId: string;
  page: number;
}): Promise<ActionResult<outfit[]>> {
  "use cache";
  cacheTag("outfits");

  try {
    if (!userId) {
      return fail("INVALID_USER", "User don't exist");
    }

    const offset = (page - 1) * DEFAULT_PAGE_LIMIT;

    const { rows } = await query(
      `
      SELECT o.id, o.name, o.note, array_agg(i.id) AS item_ids, array_agg(i.name) AS items, array_agg(i.image_keys[1]) AS primary_image_keys,
        COUNT(*) OVER () AS total
      FROM outfits o 
      INNER JOIN outfit_items oi 
      ON o.id=oi.outfit_id 
      INNER JOIN items i 
      ON oi.item_id=i.id
      WHERE o.user_id=$1
      GROUP BY o.id, o.name, o.note 
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [userId, DEFAULT_PAGE_LIMIT, offset],
    );

    await Promise.all(
      rows.map(
        async (outfit) =>
        (outfit.primary_image_keys = await Promise.all(
          outfit.primary_image_keys.map(async (key: string) => {
            if (!key) {
              return null;
            }
            const res = await generateItemImageUrls({ imageKeys: [key] });
            if (res.success) {
              return res.data[0];
            }
            return null;
          }),
        )),
      ),
    );

    return ok(rows);
  } catch (error) {
    console.log("[ERROR] db error: ", error);
    return fail("DB_ERROR", "Failed to fetch outfits");
  }
}

export async function getOutfit({
  outfitId,
  userId,
}: {
  outfitId: string;
  userId: string;
}): Promise<ActionResult<outfit>> {
  "use cache";
  cacheTag("outfit");

  try {
    if (!userId) {
      return fail("INVALID_USER", "User don't exist");
    }

    const { rows } = await query(
      `
      SELECT o.id, o.name, o.note, array_agg(i.id) AS item_ids, array_agg(i.name) AS items, array_agg(i.image_keys[1]) AS primary_image_keys
      FROM outfits o 
      INNER JOIN outfit_items oi 
      ON o.id=oi.outfit_id 
      INNER JOIN items i 
      ON oi.item_id=i.id
      WHERE o.id=$1 AND o.user_id=$2
      GROUP BY o.id, o.name, o.note 
      ORDER BY o.created_at DESC
    `,
      [outfitId, userId],
    );

    await Promise.all(
      rows.map(
        async (outfit) =>
        (outfit.primary_image_keys = await Promise.all(
          outfit.primary_image_keys.map(async (key: string) => {
            if (!key) {
              return null;
            }
            const res = await generateItemImageUrls({ imageKeys: [key] });
            if (res.success) {
              return res.data[0];
            }
            return null;
          }),
        )),
      ),
    );

    return ok(rows[0]);
  } catch (error) {
    console.log("[ERROR] db error: ", error);
    return fail("DB_ERROR", "Failed to fetch outfit");
  }
}

export async function deleteOutfit({
  outfitId,
  userId,
}: {
  outfitId: number;
  userId: string;
}): Promise<ActionResult<null>> {
  try {
    if (!userId) {
      return fail("INVALID_USER", "User don't exist");
    }
    if (!outfitId) {
      return fail("INVALID_OUTFIT", "Outfit don't exist");
    }

    await query("DELETE FROM outfits WHERE id=$1 AND user_id=$2", [
      outfitId,
      userId,
    ]);

    updateTag("outfit");
    updateTag("outfits");
    return ok(null);
  } catch (error) {
    console.log("[ERROR] db error: ", error);
    return fail("DB_ERROR", "Failed to delete outfit");
  }
}

export async function getOutfitItemIds(
  outfitId: string,
): Promise<ActionResult<number[]>> {
  "use cache";
  cacheTag("outfit");
  try {
    if (!outfitId) {
      return fail("INVALID_OUTFIT", "Outfit don't exist");
    }

    const { rows } = await query(
      "SELECT item_id FROM outfit_items WHERE outfit_id=$1",
      [outfitId],
    );

    const itemIds = rows.map((row) => row.item_id);

    return ok(itemIds);
  } catch (error) {
    console.log("[ERROR] db error: ", error);
    return fail("DB_ERROR", "Failed to get outfit");
  }
}

type updateOutfitSchemaType = z.infer<typeof updateOutfitSchema>;
export async function updateOutfit({
  formData,
  userId,
  removedItemIds,
  outfitId,
}: {
  formData: updateOutfitSchemaType;
  userId: string;
  removedItemIds: number[];
  outfitId: number;
}): Promise<ActionResult<null>> {
  try {
    const { data, success, error } = newOutfitSchema.safeParse(formData);
    if (!success) {
      console.log("error: ", error);
      return fail("INVALUD_INPUT", "Something went wrong !");
    }

    await query("BEGIN");

    await query(
      "UPDATE outfits SET name=$1, note=$2 WHERE user_id=$3 AND id=$4",
      [data.name, data.note, userId, outfitId],
    );

    await query(
      "INSERT INTO outfit_items (outfit_id, item_id) SELECT $1, itemId FROM unnest($2::int[]) AS itemId ON CONFLICT DO NOTHING",
      [outfitId, data.selectedItemIds],
    );

    if (removedItemIds.length > 0) {
      await query(
        "DELETE FROM outfit_items WHERE outfit_id=$1 AND item_id=ANY($2)",
        [outfitId, removedItemIds],
      );
    }

    await query("COMMIT");
    updateTag("outfit");
    updateTag("outfits");
    return ok(null);
  } catch (error) {
    await query("ROLLBACK");
    console.log("[ERROR] db error: ", error);
    return fail("DB_ERROR", "Failed to update outfit");
  }
}
