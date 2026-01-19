import { getUserCategoryUsageCounts } from "@/actions/db";
import { FieldLegend } from "../ui/field";
import CategoryTable from "./CategoryTable";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Pagination } from "./Pagination";

export default async function CategoriesPage({ page }: { page: number }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/signIn");
  }

  const categories = await getUserCategoryUsageCounts({
    user_id: session.user.id,
    page,
  });

  if (!categories.success) {
    return (
      <div>
        <h1>{categories.error.message}</h1>
      </div>
    );
  }

  return (
    <div className="w-full max-w-125 space-y-4">
      <FieldLegend className="md:text-2xl! max-md:text-xl!">
        Category management
      </FieldLegend>
      <CategoryTable categories={categories.data} />
      <Pagination currentPage={page} total={categories.data[0]?.total || 0} />
    </div>
  );
}
