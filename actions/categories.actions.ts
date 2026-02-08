"use server";

import { DEFAULT_PAGE_LIMIT } from "@/constants";
import { ActionResult, fail, ok } from "@/lib/actionsType";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { categoryNameSchema } from "@/schemas";
import { cacheTag, updateTag } from "next/cache";
import { DatabaseError } from "pg";

export async function getUserCategories() {
  try {
    return withAuth(getUserCategoriesHandler, {});
  } catch {
    return fail("Unauthorized");
  }
}
async function getUserCategoriesHandler({
  userId,
}: {
  userId: string | undefined;
}): Promise<ActionResult<string[]>> {
  "use cache";
  cacheTag("categories");
  if (!userId) {
    return fail("User doesn't exist");
  }
  try {
    const { rows } = await query(
      "SELECT name FROM item_categories WHERE user_id=$1",
      [userId]
    );

    const categories: string[] = [];
    rows.map((value) => categories.push(value.name));
    return ok(categories);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("Failed to fetch categories");
  }
}

export type categoryUsageCountType = {
  id: number;
  userId: string;
  name: string;
  usageCount: number;
  total: number;
};
export async function getUserCategoriesUsageCount({
  userId,
  page = 1,
}: {
  userId: string;
  page: number;
}): Promise<ActionResult<categoryUsageCountType[]>> {
  "use cache";
  cacheTag("categoryUsageCounts");

  try {
    if (!userId) {
      return fail("User doesn't exist");
    }

    const offset = (page - 1) * DEFAULT_PAGE_LIMIT;

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
      [userId, DEFAULT_PAGE_LIMIT, offset]
    );

    const categories: categoryUsageCountType[] = [];
    rows.map((category) =>
      categories.push({
        id: category.id,
        userId: category.user_id,
        name: category.name,
        usageCount: category.count,
        total: Number(category.total),
      })
    );
    return ok(categories);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("Failed to fetch categories");
  }
}

export async function searchUserCategoriesUsageCount({
  userId,
  page = 1,
  category,
}: {
  userId: string | undefined;
  page: number;
  category: string;
}): Promise<ActionResult<categoryUsageCountType[]>> {
  "use cache";
  cacheTag("categoryUsageCounts");

  try {
    if (!userId) {
      return fail("User doesn't exist");
    }

    const offset = (page - 1) * DEFAULT_PAGE_LIMIT;

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
      [userId, `%${category}%`, DEFAULT_PAGE_LIMIT, offset]
    );

    const categories: categoryUsageCountType[] = [];
    rows.map((category) =>
      categories.push({
        id: category.id,
        userId: category.user_id,
        name: category.name,
        usageCount: category.count,
        total: Number(category.total),
      })
    );

    return ok(categories);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("Failed to fetch categories");
  }
}

export async function createNewCategory({ name }: { name: string }) {
  try {
    return withAuth(createNewCategoryHandler, { name });
  } catch {
    return fail("Unauthorized");
  }
}
async function createNewCategoryHandler({
  userId,
  name,
}: {
  userId: string;
  name: string;
}): Promise<ActionResult<null>> {
  try {
    if (!userId) {
      return fail("User doesn't exist");
    }
    if (!name) {
      return fail("Category name is required");
    }
    const { data, success, error } = categoryNameSchema.safeParse({
      name,
    });
    if (!success) {
      const errorObj = JSON.parse(error.message);
      return fail(errorObj[0].message);
    }

    await query(
      "INSERT INTO item_categories (user_id, name) VALUES ($1, lower($2));",
      [userId, data.name]
    );

    updateTag("categories");
    updateTag("categoryUsageCounts");
    return ok(null);
  } catch (error: unknown) {
    console.log(`[ERROR] db error ${error}`);
    if (error instanceof DatabaseError) {
      switch (error.code) {
        case "23505": // unique_violation
          return fail("You already have a category with this name");

        case "23503": // foreign_key_violation
          return fail("User doesn't exist");
      }
    }
    return fail("Failed to create new category");
  }
}

export async function deleteUserCategory({
  categoryId,
}: {
  categoryId: number;
}) {
  try {
    return withAuth(deleteUserCategoryHandler, { categoryId });
  } catch {
    return fail("Unauthorized");
  }
}
async function deleteUserCategoryHandler({
  userId,
  categoryId,
}: {
  userId: string;
  categoryId: number;
}): Promise<ActionResult<null>> {
  try {
    if (!userId) {
      return fail("User doesn't exist");
    }
    if (!categoryId) {
      return fail("Invalid category name");
    }

    await query("DELETE FROM item_categories WHERE id=$1 AND user_id=$2", [
      categoryId,
      userId,
    ]);

    updateTag("items");
    updateTag("categoryUsageCounts");
    updateTag("categories");
    return ok(null);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("Failed to delete category");
  }
}

export async function renameUserCategory({
  newName,
  categoryId,
}: {
  newName: string;
  categoryId: number;
}) {
  try {
    return withAuth(renameUserCategoryHandler, { newName, categoryId });
  } catch {
    return fail("Unauthorized");
  }
}
async function renameUserCategoryHandler({
  newName,
  userId,
  categoryId,
}: {
  newName: string;
  userId: string;
  categoryId: number;
}): Promise<ActionResult<null>> {
  try {
    if (!newName) {
      return fail("Invalid category name");
    }
    if (!userId) {
      return fail("User doesn't exist");
    }
    if (!categoryId) {
      return fail("Invalid category name");
    }

    await query(
      "UPDATE item_categories SET name=$1 WHERE id=$2 AND user_id=$3",
      [newName, categoryId, userId]
    );

    updateTag("items");
    updateTag("categoryUsageCounts");
    updateTag("categories");
    return ok(null);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("Failed to rename category");
  }
}
