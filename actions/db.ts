"use server";

import { ActionResult, fail, ok } from "@/lib/actionsType";
import { query } from "@/lib/db";
import { newGarmentSchema } from "@/schemas";
import { cacheTag, updateTag } from "next/cache";
import { DatabaseError } from "pg";
import z from "zod";
import { deleteImages } from "./serverUtils";

export async function getColors({
  user_id,
}: {
  user_id: string | undefined;
}): Promise<ActionResult<string[]>> {
  "use cache";
  cacheTag("colors");

  if (!user_id) {
    return fail("INVALID_USER", "User does not exist");
  }

  try {
    const primary_color =
      "SELECT user_id, primary_color::text AS color FROM garments";
    const secondary_colors =
      "SELECT user_id, UNNEST(secondary_colors)::text AS color FROM garments WHERE secondary_colors IS NOT NULL";
    const { rows } = await query(
      `SELECT DISTINCT color 
        FROM (${primary_color} UNION ALL ${secondary_colors}) colors 
        WHERE user_id=$1 
        ORDER BY color`,
      [user_id],
    );

    const colors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      colors.push(rows[i].color);
    }

    return ok(colors);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("DB_ERROR", "Failed to fetch colors");
  }
}

export async function getTags({
  user_id,
}: {
  user_id: string | undefined;
}): Promise<ActionResult<string[]>> {
  "use cache";
  cacheTag("tags");

  if (!user_id) {
    return fail("INVALID_USER", "User does not exist");
  }

  try {
    const { rows } = await query("SELECT name FROM tags WHERE user_id=$1", [
      user_id,
    ]);

    const tags: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      tags.push(rows[i].name);
    }

    return ok(tags);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("DB_ERROR", "Failed to fetch tags");
  }
}

type newGarmentSchemaType = z.infer<typeof newGarmentSchema>;
export async function addNewGarment({
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
      ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
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

    const { rows: tagRows } = await query(
      "INSERT INTO tags (name, user_id) SELECT unnest($1::text[]), $2 ON CONFLICT DO NOTHING RETURNING id",
      [data.tags, user_id],
    );

    await query(
      `INSERT INTO garment_tags (tag_id, garment_id)
     SELECT id, $1 FROM unnest($2::int[]) AS id
      ON CONFLICT DO NOTHING;`,
      [garmentId, tagRows.map((r) => r.id)],
    );

    await query("COMMIT");

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

export async function getUserCategories({
  user_id,
}: {
  user_id: string | undefined;
}): Promise<ActionResult<string[]>> {
  "use cache";
  cacheTag("categories");
  if (!user_id) {
    return fail("INVALID_USER", "User does not exist");
  }
  try {
    const { rows } = await query(
      "SELECT name FROM garment_categories WHERE user_id=$1",
      [user_id],
    );

    const categories: string[] = [];
    rows.map((value) => categories.push(value.name));
    return ok(categories);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("DB_ERROR", "Failed to fetch categories");
  }
}

export type categoryUsageCount = {
  id: number;
  user_id: string;
  name: string;
  usageCount: number;
  total: number;
};
export async function getUserCategoriesUsageCount({
  user_id,
  page = 1,
}: {
  user_id: string | undefined;
  page: number;
}): Promise<ActionResult<categoryUsageCount[]>> {
  "use cache";
  cacheTag("categoryUsageCounts");

  const limit = 10;
  const offset = (page - 1) * limit;

  if (!user_id) {
    return fail("INVALID_USER", "User does not exist");
  }
  try {
    const { rows } = await query(
      "SELECT gc.id, gc.user_id, gc.name, COUNT(g.id), COUNT(*) OVER () AS total FROM garments g RIGHT JOIN garment_categories gc ON g.category_id=gc.id WHERE gc.user_id=$1 GROUP BY gc.name, gc.id ORDER BY gc.name LIMIT $2 OFFSET $3;",
      [user_id, limit, offset],
    );

    const categories: categoryUsageCount[] = [];
    rows.map((category) =>
      categories.push({
        id: category.id,
        user_id: category.user_id,
        name: category.name,
        usageCount: category.count,
        total: Number(category.total),
      }),
    );
    return ok(categories);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("DB_ERROR", "Failed to fetch categories");
  }
}

export async function searchUserCategoriesUsageCount({
  user_id,
  page = 1,
  category,
}: {
  user_id: string | undefined;
  page: number;
  category: string;
}): Promise<ActionResult<categoryUsageCount[]>> {
  "use cache";
  cacheTag("categoryUsageCounts");

  const limit = 10;
  const offset = (page - 1) * limit;

  if (!user_id) {
    return fail("INVALID_USER", "User does not exist");
  }

  try {
    const { rows } = await query(
      "SELECT gc.id, gc.user_id, gc.name, COUNT(g.id), COUNT(*) OVER () AS total FROM garments g RIGHT JOIN garment_categories gc ON g.category_id=gc.id WHERE gc.user_id=$1 AND gc.name ILIKE $2 GROUP BY gc.name, gc.id ORDER BY gc.name LIMIT $3 OFFSET $4;",
      [user_id, `%${category}%`, limit, offset],
    );

    const categories: categoryUsageCount[] = [];
    rows.map((category) =>
      categories.push({
        id: category.id,
        user_id: category.user_id,
        name: category.name,
        usageCount: category.count,
        total: Number(category.total),
      }),
    );

    return ok(categories);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("DB_ERROR", "Failed to fetch categories");
  }
}

export async function createNewCategory({
  user_id,
  name,
}: {
  user_id: string;
  name: string;
}): Promise<ActionResult<null>> {
  if (!user_id) {
    return fail("INVALID_USER", "User does not exist");
  }

  if (!name) {
    return fail("INVALUD_INPUT", "Category name is required");
  }

  try {
    await query(
      "INSERT INTO garment_categories (user_id, name) VALUES ($1, $2);",
      [user_id, name],
    );

    updateTag("categories");
    updateTag("categoryUsageCounts");
    return ok(null);
  } catch (error: unknown) {
    if (error instanceof DatabaseError) {
      switch (error.code) {
        case "23505": // unique_violation
          return fail(
            "CATEGORY_ALREADY_EXISTS",
            "You already have a category with this name",
          );

        case "23503": // foreign_key_violation
          return fail("INVALID_USER", "User does not exist");
      }
    }
    console.log(`[ERROR] db error ${error}`);
    return fail("DB_ERROR", "Failed to create category");
  }
}

export async function deleteUserCategory({
  user_id,
  category_id,
}: {
  user_id: string;
  category_id: number;
}): Promise<ActionResult<null>> {
  if (!user_id) {
    return fail("INVALID_USER", "User does not exist");
  }
  if (!category_id) {
    return fail("INVALID_CATEGORY", "Invalid category name");
  }
  try {
    await query("DELETE FROM garment_categories WHERE id=$1 AND user_id=$2", [
      category_id,
      user_id,
    ]);
    updateTag("categoryUsageCounts");
    updateTag("categories");
    return ok(null);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("DB_ERROR", "Failed to fetch tags");
  }
}

export async function renameUserCategory({
  newName,
  user_id,
  category_id,
}: {
  newName: string;
  user_id: string;
  category_id: number;
}): Promise<ActionResult<null>> {
  if (!newName) {
    return fail("INVALID_CATEGORY", "Invalid category name");
  }
  if (!user_id) {
    return fail("INVALID_USER", "User does not exist");
  }
  if (!category_id) {
    return fail("INVALID_CATEGORY", "Invalid category name");
  }
  try {
    await query(
      "UPDATE garment_categories SET name=$1 WHERE id=$2 AND user_id=$3",
      [newName, category_id, user_id],
    );
    updateTag("categoryUsageCounts");
    updateTag("categories");
    return ok(null);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("DB_ERROR", "Failed to fetch tags");
  }
}
