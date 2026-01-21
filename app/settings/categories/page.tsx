import CategoriesPage from "@/components/Category/CategoriesPage";
import { renameCategorySchema } from "@/schemas";

export default async function Categories({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  let page = Number(params.page) || 1;
  let category: string | null;

  const { data, success } = renameCategorySchema.safeParse({
    name: params.category,
  });
  if (!success) {
    category = null;
  } else {
    category = data.name;
  }

  if (page < 0) {
    page = 1;
  }
  return <CategoriesPage page={page} category={category} />;
}
