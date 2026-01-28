"use server";

import { ActionResult, fail, ok } from "@/lib/actionsType";
import { query } from "@/lib/db";
import { newGarmentSchema } from "@/schemas";
import { cacheTag, updateTag } from "next/cache";
import z from "zod";
import { DatabaseError } from "pg";
import { deleteImages } from "./images.actions";

type itemType = {
  id: number;
  name: string;
  seasons: string[];
  primary_color: string;
  secondary_colors: string[];
  brand: string;
  image_keys: string[];
  category: string;
  tags: { id: number; name: string }[];
  total: number;
};

export async function getItems({
  user_id,
  page,
}: {
  user_id: string;
  page: number;
}): Promise<ActionResult<itemType[]>> {
  "use cache";
  cacheTag("items");

  if (!user_id) {
    return fail("INVALID_USER", "User don't exist");
  }

  const limit = 4;
  const offset = (page - 1) * limit;

  const { rows } = await query(
    `SELECT g.id, g.name, g.season::text[] AS seasons, g.primary_color, g.secondary_colors::text[] AS secondary_colors, 
      g.brand, g.image_url::text[] AS image_keys,gc.name AS category,
      COUNT(*) OVER () AS total,
      COALESCE(
        json_agg(json_build_object('id', t.id, 'name', t.name)) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS tags
    FROM garments g 
    LEFT JOIN garment_categories gc ON g.category_id=gc.id
    LEFT JOIN garment_tags gt ON gt.garment_id=g.id
    LEFT JOIN tags t ON t.id=gt.tag_id
    WHERE g.user_id=$1
    GROUP BY g.id, gc.name
    ORDER BY g.created_at DESC
    LIMIT $2 OFFSET $3;
    `,
    [user_id, limit, offset],
  );

  return ok(rows);
}

type newGarmentSchemaType = z.infer<typeof newGarmentSchema>;
export async function addNewItem({
  user_id,
  formData,
}: {
  user_id: string;
  formData: newGarmentSchemaType;
}): Promise<ActionResult<null>> {
  try {
    if (!user_id) {
      deleteImages(formData.images);
      return fail("INVALID_USER", "User does not exist");
    }

    const { data, success, error } = newGarmentSchema.safeParse(formData);
    if (!success) {
      deleteImages(formData.images);
      console.log("error: ", error);
      return fail("INVALUD_INPUT", "Something went wrong !");
    }

    await query("BEGIN");

    const { rows: categoryRows } = await query(
      "SELECT id FROM garment_categories WHERE name=$1",
      [data.category],
    );

    const category_id = categoryRows[0].id;
    if (!category_id) {
      deleteImages(formData.images);
      return fail("INVALID_CATEGORY", "Category not found");
    }

    const { rows: garmentRows } = await query(
      `INSERT INTO garments (user_id, name, category_id, season, primary_color, secondary_colors, brand, image_url) VALUES
      ($1, lower($2), $3, $4, $5, $6, lower($7), $8) RETURNING id`,
      [
        user_id,
        formData.name,
        category_id,
        formData.seasons,
        formData.primaryColor,
        formData.secondaryColors,
        formData.brand,
        formData.images,
      ],
    );
    const garmentId = garmentRows[0].id;

    // Insert tags (ignore duplicate)
    await query(
      `INSERT INTO tags (name, user_id) 
      SELECT lower(tag), $2 
      FROM unnest($1::text[]) AS tag 
      ON CONFLICT DO NOTHING
    `,
      [data.tags, user_id],
    );

    // Get all tag IDs (existing + new)
    const { rows: tagRows } = await query(
      `SELECT id FROM tags 
      WHERE user_id=$1
      AND name = ANY (
        SELECT lower(tag) FROM unnest($2::text[]) AS tag
      )`,
      [user_id, data.tags],
    );

    // Insert into garment_tags
    await query(
      `INSERT INTO garment_tags (tag_id, garment_id)
     SELECT id, $1 FROM unnest($2::int[]) AS id
      ON CONFLICT DO NOTHING;`,
      [garmentId, tagRows.map((r) => r.id)],
    );

    await query("COMMIT");

    updateTag("items");
    updateTag("tags");
    updateTag("colors");
    return ok(null);
  } catch (error: unknown) {
    await query("ROLLBACK");
    deleteImages(formData.images);
    if (error instanceof DatabaseError) {
      switch (error.code) {
        case "23505": // unique_violation
          return fail(
            "ITEM_ALREADY_EXIST",
            "You already have an item with this name",
          );

        case "23503": // foreign_key_violation
          return fail("INVALID_USER", "User does not exist");
      }
    }
    console.log(`[ERROR] db error ${error}`);
    return fail("DB_ERROR", "Failed to add a new item");
  }
}
