import { FieldLegend } from "../ui/field";
import CategoryTable from "./CategoryTable";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Pagination } from "./Pagination";
import ActionBar from "./ActionBar";
import {
  getUserCategoriesUsageCount,
  searchUserCategoriesUsageCount,
} from "@/actions/categories.actions";

export default async function CategoriesPage({
  page,
  category,
}: {
  page: number;
  category: string | null;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/signIn");
  }

  let categories;
  if (!category) {
    categories = await getUserCategoriesUsageCount({
      user_id: session.user.id,
      page,
    });
  } else {
    categories = await searchUserCategoriesUsageCount({
      user_id: session.user.id,
      category,
      page,
    });
  }

  if (!categories.success) {
    return (
      <div className="w-full flex justify-center items-center">
        <h1>{categories.error.message}</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <FieldLegend className="md:text-2xl! max-md:text-xl!">
        Category management
      </FieldLegend>
      <div className="min-h-[400px] flex flex-col gap-4">
        <ActionBar />
        <CategoryTable categories={categories.data} />
        <Pagination currentPage={page} total={categories.data[0]?.total || 0} />
      </div>
    </div>
  );
}
