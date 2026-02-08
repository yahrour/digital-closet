"use server";

import { DEFAULT_PAGE_LIMIT } from "@/constants";
import { ActionResult, fail, ok } from "@/lib/actionsType";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { editItemSchema, newItemSchema } from "@/schemas";
import { cacheTag, updateTag } from "next/cache";
import { DatabaseError } from "pg";
import z from "zod";
import { deleteImages } from "./images.actions";

export type itemType = {
  id: number;
  name: string;
  seasons: string[];
  primary_color: string;
  secondary_colors: string[];
  brand: string;
  image_keys: string[];
  category: string;
  tags: { id: number; name: string }[];
  total?: number;
};

export async function getItems({
  userId,
  page,
  categories,
  seasons,
  colors,
  tags,
}: {
  userId: string;
  page: number;
  categories: string[] | null;
  seasons: string[] | null;
  colors: string[] | null;
  tags: string[] | null;
}): Promise<ActionResult<itemType[]>> {
  "use cache";
  cacheTag("items");

  if (!userId) {
    return fail("User doesn't exist");
  }

  const offset = (page - 1) * DEFAULT_PAGE_LIMIT;

  try {
    const { rows } = await query(
      `SELECT i.id, i.name, i.seasons::text[], i.primary_color, i.secondary_colors::text[], 
      i.brand, i.image_keys::text[],ic.name AS category,
      COUNT(*) OVER () AS total,
      COALESCE(
        json_agg(json_build_object('id', t.id, 'name', t.name)) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS tags
    FROM items i 
    LEFT JOIN item_categories ic ON ic.id=i.category_id
    LEFT JOIN item_tags it ON it.item_id=i.id
    LEFT JOIN tags t ON t.id=it.tag_id
    WHERE i.user_id=$1
    AND ($2::text[] IS NULL OR ic.name = ANY($2::text[]))
    AND ($3::season_type[] IS NULL OR i.seasons && $3::season_type[])
    AND ($4::color_type[] IS NULL OR i.primary_color = ANY($4::color_type[]) OR i.secondary_colors && $4::color_type[])
    AND ($5::text[] IS NULL OR t.name = ANY($5::text[]))
    GROUP BY i.id, ic.name
    ORDER BY i.created_at DESC
    LIMIT $6 OFFSET $7;
    `,
      [userId, categories, seasons, colors, tags, DEFAULT_PAGE_LIMIT, offset]
    );

    return ok(rows);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("Failed to fetch items");
  }
}

type newItemSchemaType = z.infer<typeof newItemSchema>;
export async function addNewItem({
  formData,
}: {
  formData: newItemSchemaType;
}) {
  try {
    return withAuth(addNewItemHandler, { formData });
  } catch {
    return fail("Unauthorized");
  }
}
async function addNewItemHandler({
  userId,
  formData,
}: {
  userId: string;
  formData: newItemSchemaType;
}): Promise<ActionResult<null>> {
  try {
    if (!userId) {
      deleteImages(formData.images);
      return fail("User doesn't exist");
    }

    const { data, success } = newItemSchema.safeParse(formData);
    if (!success) {
      deleteImages(formData.images);
      return fail("Something went wrong !");
    }

    await query("BEGIN");

    const { rows: categoryRows } = await query(
      "SELECT id FROM item_categories WHERE name=$1",
      [data.category]
    );

    const category_id = categoryRows[0].id;
    if (!category_id) {
      deleteImages(formData.images);
      return fail("Category not found");
    }

    const { rows: itemRows } = await query(
      `INSERT INTO items (user_id, name, category_id, seasons, primary_color, secondary_colors, brand, image_keys) VALUES
      ($1, lower($2), $3, $4, $5, $6, lower($7), $8) RETURNING id`,
      [
        userId,
        formData.name,
        category_id,
        formData.seasons,
        formData.primaryColor,
        formData.secondaryColors,
        formData.brand,
        formData.images,
      ]
    );
    const itemId = itemRows[0].id;

    // Insert tags (ignore duplicate)
    await query(
      `INSERT INTO tags (name, user_id) 
      SELECT lower(tag), $2 
      FROM unnest($1::text[]) AS tag 
      ON CONFLICT DO NOTHING
    `,
      [data.tags, userId]
    );

    // Get all tag IDs (old + new)
    const { rows: tagRows } = await query(
      `SELECT id FROM tags 
      WHERE user_id=$1
      AND name = ANY (
        SELECT lower(tag) FROM unnest($2::text[]) AS tag
      )`,
      [userId, data.tags]
    );

    // Insert into item_tags
    await query(
      `INSERT INTO item_tags (tag_id, item_id)
     SELECT id, $1 FROM unnest($2::int[]) AS id
      ON CONFLICT DO NOTHING;`,
      [itemId, tagRows.map((r) => r.id)]
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
          return fail("You already have an item with this name");

        case "23503": // foreign_key_violation
          return fail("User doesn't exist");
      }
    }
    console.log(`[ERROR] db error ${error}`);
    return fail("Failed to add a new item");
  }
}

export async function getItem({
  userId,
  itemId,
}: {
  userId: string;
  itemId: string;
}): Promise<ActionResult<itemType>> {
  "use cache";
  cacheTag("item");

  if (!userId) {
    return fail("User doesn't exist");
  }
  if (!itemId) {
    return fail("Item doesn't exist");
  }

  try {
    const { rows } = await query(
      `SELECT i.id, i.name, i.seasons::text[], i.primary_color, i.secondary_colors::text[], 
      i.brand, i.image_keys::text[],ic.name AS category,
      COALESCE(
        json_agg(json_build_object('id', t.id, 'name', t.name)) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS tags
    FROM items i 
    LEFT JOIN item_categories ic ON ic.id=i.category_id
    LEFT JOIN item_tags it ON it.item_id=i.id
    LEFT JOIN tags t ON t.id=it.tag_id
    WHERE i.user_id=$1 AND i.id=$2
    GROUP BY i.id, ic.name
    ORDER BY i.created_at DESC
    `,
      [userId, itemId]
    );

    return ok(rows[0]);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("Failed to fetch item");
  }
}

export async function deleteItem({
  itemId,
  imageKeys,
}: {
  itemId: number;
  imageKeys: string[];
}) {
  try {
    return withAuth(deleteItemHandler, { itemId, imageKeys });
  } catch {
    return fail("Unauthorized");
  }
}
async function deleteItemHandler({
  userId,
  itemId,
  imageKeys,
}: {
  userId: string;
  itemId: number;
  imageKeys: string[];
}): Promise<ActionResult<null>> {
  if (!userId) {
    return fail("User doesn't exist");
  }
  if (!itemId) {
    return fail("Item doesn't exist");
  }

  try {
    deleteImages(imageKeys);

    await query("DELETE FROM items WHERE id=$1 AND user_id=$2", [
      itemId,
      userId,
    ]);

    updateTag("colors");
    updateTag("items");
    updateTag("categoryUsageCounts");
    return ok(null);
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return fail("Failed to delete item");
  }
}

type editItemSchemaType = z.infer<typeof editItemSchema>;
export async function updateItem({
  itemId,
  formData,
  deletedTags,
}: {
  itemId: number;
  formData: editItemSchemaType;
  deletedTags: string[];
}) {
  try {
    return withAuth(updateItemHandler, { itemId, formData, deletedTags });
  } catch {
    return fail("Unauthorized");
  }
}
async function updateItemHandler({
  userId,
  itemId,
  formData,
  deletedTags,
}: {
  userId: string;
  itemId: number;
  formData: editItemSchemaType;
  deletedTags: string[];
}): Promise<ActionResult<null>> {
  try {
    if (!userId) {
      if (formData.newImages && formData.newImages.length > 0) {
        deleteImages(formData.newImages);
      }
      return fail("User doesn't exist");
    }

    const { data, success } = editItemSchema.safeParse(formData);
    if (!success) {
      if (formData.newImages && formData.newImages.length > 0) {
        deleteImages(formData.newImages);
      }
      return fail("Something went wrong !");
    }

    await query("BEGIN");

    const { rows: categoryRows } = await query(
      "SELECT id FROM item_categories WHERE name=$1",
      [data.category]
    );

    const categoryId = categoryRows[0].id;
    if (!categoryId) {
      if (formData.newImages && formData.newImages.length > 0) {
        deleteImages(formData.newImages);
      }
      return fail("Category not found");
    }

    let imageKeys: string[] = [];
    if (formData.newImages && formData.newImages.length > 0) {
      imageKeys = formData.newImages;
    } else if (formData.existImageKeys && formData.existImageKeys.length > 0) {
      imageKeys = formData.existImageKeys;
    } else {
      return fail("Upload at least one image.");
    }

    const { rows: itemRows } = await query(
      `UPDATE items SET name=$1, category_id=$2, seasons=$3, primary_color=$4, secondary_colors=$5, brand=$6, image_keys=$7
      WHERE user_id=$8 AND id=$9 RETURNING id`,
      [
        formData.name,
        categoryId,
        formData.seasons,
        formData.primaryColor,
        formData.secondaryColors,
        formData.brand,
        imageKeys,
        userId,
        itemId,
      ]
    );
    const insertedItemId = itemRows[0].id;

    // Insert tags (ignore duplicate)
    await query(
      `INSERT INTO tags (name, user_id) 
      SELECT lower(tag), $2 
      FROM unnest($1::text[]) AS tag 
      ON CONFLICT DO NOTHING
    `,
      [data.tags, userId]
    );

    // Get all tag IDs (existing + new)
    const { rows: tagRows } = await query(
      `SELECT id FROM tags 
      WHERE user_id=$1
      AND name = ANY (
        SELECT lower(tag) FROM unnest($2::text[]) AS tag
      )`,
      [userId, data.tags]
    );

    // Insert into item_tags
    await query(
      `INSERT INTO item_tags (tag_id, item_id)
     SELECT id, $1 FROM unnest($2::int[]) AS id
      ON CONFLICT DO NOTHING;`,
      [insertedItemId, tagRows.map((r) => r.id)]
    );

    // Get removed tags id
    const { rows: deletedTagsRows } = await query(
      "SELECT id FROM tags WHERE name=ANY($1::text[])",
      [deletedTags]
    );
    const deletedTagsIds = deletedTagsRows.map((tag) => tag.id);
    // Delete removed tags
    await query(
      `DELETE FROM item_tags WHERE tag_id=ANY($1::int[]) AND item_id=$2`,
      [deletedTagsIds, itemId]
    );

    // Delete removed images
    if (formData.deletedImageKeys && formData.deletedImageKeys?.length > 0) {
      deleteImages(formData.deletedImageKeys);
    }

    await query("COMMIT");

    updateTag("item");
    updateTag("items");
    updateTag("tags");
    updateTag("colors");
    return ok(null);
  } catch (error: unknown) {
    console.log(`[ERROR] db error ${error}`);
    await query("ROLLBACK");
    if (formData.newImages && formData.newImages.length > 0) {
      deleteImages(formData.newImages);
    }
    if (error instanceof DatabaseError) {
      switch (error.code) {
        case "23505": // unique_violation
          return fail("You already have an item with this name");

        case "23503": // foreign_key_violation
          return fail("User doesn't exist");
      }
    }
    return fail("Failed to update item");
  }
}
