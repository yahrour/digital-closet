"use server";

import { newGarmentSchemaType } from "@/app/garments/new/page";
import { ActionResult, fail, ok } from "@/lib/actionsType";
import { query } from "@/lib/db";
import { cacheTag, revalidateTag, updateTag } from "next/cache";
import { DatabaseError } from "pg";

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

export async function addNewGarment(
  formData: newGarmentSchemaType,
): Promise<ActionResult<null>> {
  console.log("data: ", formData);
  return ok(null);
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
  page,
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
  page,
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
  await new Promise((res) => setTimeout(res, 5000));

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
