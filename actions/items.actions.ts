"use server";

import { query } from "@/lib/db";
import { cacheTag } from "next/cache";

type itemType = {
  id: number;
  name: string;
  seasons: string[];
  primary_color: string;
  secondary_colors: string[];
  brand: string;
  image_keys: string[];
  category: string;
};

export async function getItems({
  user_id,
}: {
  user_id: string;
}): Promise<itemType[] | null> {
  "use cache";
  cacheTag("items");

  if (!user_id) {
    return null;
  }

  const { rows } = await query(
    `
    SELECT g.id, g.name, g.season::text[] AS seasons, g.primary_color, g.secondary_colors::text[] AS secondary_colors, g.brand, g.image_url::text[] AS image_keys,gc.name AS category 
    FROM garments g 
    INNER JOIN garment_categories gc 
    ON g.category_id=gc.id 
    WHERE g.user_id=$1
    ORDER BY g.created_at DESC
    `,
    [user_id],
  );

  return rows;
}
