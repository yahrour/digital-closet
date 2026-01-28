import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AuthGate from "@/components/AuthGate";
import { getUserCategories } from "@/actions/categories.actions";
import { getColors } from "@/actions/colors.actions";

import { getTags } from "@/actions/tags.actions";
import { ItemFiltersSelect } from "./ItemFiltersSelect";

export async function ItemFiltersContainer() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id;

  if (!session) {
    return <AuthGate />;
  }

  const [categories, colors, tags] = await Promise.all([
    getUserCategories({ user_id: userId }),
    getColors({ user_id: userId }),
    getTags({ user_id: userId }),
  ]);

  return (
    <ItemFiltersSelect categories={categories} colors={colors} tags={tags} />
  );
}
