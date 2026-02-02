"use server";

import { newOutfitSchemaType } from "@/components/Outfits/New/CreateOutfitDialog";
import { ActionResult, fail, ok } from "@/lib/actionsType";
import { query } from "@/lib/db";
import { newOutfitSchema } from "@/schemas";

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
    return ok(null);
  } catch (error) {
    await query("ROLLBACK");
    console.log("[ERROR] db error: ", error);
    return fail("DB_ERROR", "Failed to create outfit");
  }
}
