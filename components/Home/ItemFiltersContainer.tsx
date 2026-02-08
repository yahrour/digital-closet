import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AuthGate from "@/components/AuthGate";
import { getUserCategories } from "@/actions/categories.actions";
import { getColors } from "@/actions/colors.actions";

import { getTags } from "@/actions/tags.actions";
import { ItemFiltersSelect } from "./ItemFiltersSelect";

export async function ItemFiltersContainer() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return <AuthGate />;
  }

  const [categories, colors, tags] = await Promise.all([
    getUserCategories(),
    getColors({ userId: session.user.id }),
    getTags({ userId: session.user.id }),
  ]);

  return (
    <ItemFiltersSelect categories={categories} colors={colors} tags={tags} />
  );
}
