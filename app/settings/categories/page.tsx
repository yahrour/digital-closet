import CategoriesPage from "@/components/Category/CategoriesPage";

export default async function Categories({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  let page = Number((await searchParams).page) || 1;
  if (page < 0) {
    page = 1;
  }
  return (
    <div className="w-full max-w-125">
      <CategoriesPage page={page} />
    </div>
  );
}
