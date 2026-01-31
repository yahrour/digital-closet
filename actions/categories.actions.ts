"use server";

import { ActionResult, fail, ok } from "@/lib/actionsType";
import { query } from "@/lib/db";
import { cacheTag, updateTag } from "next/cache";
import { DatabaseError } from "pg";

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
      "SELECT name FROM item_categories WHERE user_id=$1",
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
      `
      SELECT ic.id, ic.user_id, ic.name, COUNT(i.id), 
      COUNT(*) OVER () AS total 
      FROM items i 
      RIGHT JOIN item_categories ic 
      ON i.category_id=ic.id 
      WHERE ic.user_id=$1 
      GROUP BY ic.name, ic.id 
      ORDER BY ic.name 
      LIMIT $2 OFFSET $3;`,
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
      `
      SELECT ic.id, ic.user_id, ic.name, COUNT(i.id), COUNT(*) OVER () AS total 
      FROM items i 
      RIGHT JOIN item_categories ic 
      ON i.category_id=ic.id 
      WHERE ic.user_id=$1 AND ic.name ILIKE $2 
      GROUP BY ic.name, ic.id 
      ORDER BY ic.name 
      LIMIT $3 OFFSET $4;`,
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
      "INSERT INTO item_categories (user_id, name) VALUES ($1, lower($2));",
      [user_id, name],
    );

    updateTag("categories");
    updateTag("categoryUsageCounts");
    return ok(null);
  } catch (error: unknown) {
    console.log(`[ERROR] db error ${error}`);
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
    await query("DELETE FROM item_categories WHERE id=$1 AND user_id=$2", [
      category_id,
      user_id,
    ]);

    updateTag("items");
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
      "UPDATE item_categories SET name=$1 WHERE id=$2 AND user_id=$3",
      [newName, category_id, user_id],
    );

    updateTag("items");
    updateTag("categoryUsageCounts");
    updateTag("categories");
    return ok(null);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("DB_ERROR", "Failed to fetch tags");
  }
}
