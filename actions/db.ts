"use server";

import { newGarmentSchemaType } from "@/app/garments/new/page";
import { query } from "@/lib/db";
import { cacheTag, updateTag } from "next/cache";

export async function getColors({ user_id }: { user_id: string | undefined }) {
  "use cache";
  cacheTag("colors");

  if (!user_id) {
    return null;
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

    return colors;
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return null;
  }
}

export async function getTags({ user_id }: { user_id: string | undefined }) {
  "use cache";
  cacheTag("tags");

  if (!user_id) {
    return null;
  }

  try {
    const { rows } = await query("SELECT name FROM tags WHERE user_id=$1", [
      user_id,
    ]);

    const tags: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      tags.push(rows[i].name);
    }

    return tags;
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return null;
  }
}

export async function addNewGarment(formData: newGarmentSchemaType) {
  console.log("data: ", formData);

  updateTag("colors");
}

export async function getUserCategories({
  user_id,
}: {
  user_id: string | undefined;
}) {
  "use cache";
  cacheTag("categories");
  if (!user_id) {
    return null;
  }
  try {
    const { rows } = await query(
      "SELECT name FROM garment_categories WHERE user_id=$1",
      [user_id],
    );

    const categories: string[] = [];
    rows.map((value) => categories.push(value.name));
    return categories;
  } catch (error) {
    console.log(`[ERROR] db error ${error}`);
    return null;
  }
}
