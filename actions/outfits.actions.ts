"use server";

import { newOutfitSchemaType } from "@/components/Outfits/New/CreateOutfitDialog";
import { ActionResult, fail, ok } from "@/lib/actionsType";
import { query } from "@/lib/db";
import { newOutfitSchema } from "@/schemas";
import { generateItemImageUrls } from "./images.actions";
import { cacheTag, updateTag } from "next/cache";

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
};

export async function getOutfits(
  userId: string,
): Promise<ActionResult<outfit[]>> {
  "use cache";
  cacheTag("outfits");

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
      WHERE o.user_id=$1
      GROUP BY o.id, o.name, o.note 
      ORDER BY o.created_at DESC
    `,
      [userId],
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
  await new Promise((res) => setTimeout(res, 5000));
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
