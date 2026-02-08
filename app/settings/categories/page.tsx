import {
  getUserCategoriesUsageCount,
  searchUserCategoriesUsageCount,
} from "@/actions/categories.actions";
import AuthGate from "@/components/AuthGate";
import ActionBar from "@/components/Category/ActionBar";
import CategoryTable from "@/components/Category/CategoryTable";
import { Pagination } from "@/components/Pagination";
import { FieldLegend } from "@/components/ui/field";
import { auth } from "@/lib/auth";
import { categoryNameSchema } from "@/schemas";
import { headers } from "next/headers";

export default async function Categories({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <AuthGate />;
  }

  const params = await searchParams;
  let page = Number(params.page) || 1;
  if (page < 0) {
    page = 1;
  }

  let categoryParam: string | null = params.category || null;
  const { data, success } = categoryNameSchema.safeParse({
    name: categoryParam,
  });
  if (!success) {
    categoryParam = null;
  } else {
    categoryParam = data.name;
  }

  let categories;
  if (!categoryParam) {
    categories = await getUserCategoriesUsageCount({
      userId: session.user.id,
      page,
    });
  } else {
    categories = await searchUserCategoriesUsageCount({
      userId: session.user.id,
      category: categoryParam,
      page,
    });
  }

  if (!categories.success) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <h1 className="text-xl text-center text-gray-500 w-full">
          {categories.error.message}
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      <FieldLegend className="md:text-2xl! max-md:text-xl!">
        Category management
      </FieldLegend>
      <div className="min-h-[400px] flex flex-col gap-4">
        <ActionBar />
        <CategoryTable categories={categories.data} />
        {categories.data.length > 0 ? (
          <>
            <Pagination
              currentPage={page}
              total={categories.data[0]?.total || 0}
            />
          </>
        ) : (
          <div className="mt-6 mx-auto">
            <h1 className="text-base text-center text-gray-500">
              No categories found
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}
