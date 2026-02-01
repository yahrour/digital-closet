import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AuthGate from "@/components/AuthGate";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { getItems } from "@/actions/items.actions";
import { generateItemImageUrls } from "@/actions/images.actions";
import { ItemFiltersSkeleton } from "./ItemFiltersSkeleton";
import { ItemFiltersContainer } from "./ItemFiltersContainer";
import { Pagination } from "./Pagination";

function buildFiltersDefaultValues(
  paramValue: string | undefined,
): string[] | null {
  if (!paramValue || paramValue.length === 0) {
    return null;
  }
  return paramValue.split(",");
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  let page = Number(params.page) || 1;
  if (page < 1) {
    page = 1;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <AuthGate />;
  }

  const categoriesParams = buildFiltersDefaultValues(params.categories);
  const seasonsParams = buildFiltersDefaultValues(params.seasons);
  const colorsParams = buildFiltersDefaultValues(params.colors);
  const tagsParams = buildFiltersDefaultValues(params.tags);

  const items = await getItems({
    userId: session.user.id,
    categories: categoriesParams,
    seasons: seasonsParams,
    colors: colorsParams,
    tags: tagsParams,
    page,
  });

  if (!items.success) {
    return <h1>{items.error.message}</h1>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Suspense fallback={<ItemFiltersSkeleton />}>
        <ItemFiltersContainer />
      </Suspense>

      {items.data.length === 0 && (
        <h1 className="text-xl text-center text-gray-500 w-full">
          No item found
        </h1>
      )}

      <div className="grid grid-cols-4 max-lg:grid-cols-3 max-sm:grid-cols-2 gap-6 justify-center items-center">
        {items.data?.map(async (item) => {
          const urls = await generateItemImageUrls({
            imageKeys: item.image_keys,
          });
          return (
            <Link
              href={`/items/${item.id}`}
              key={item.id}
              prefetch={false}
              className="group mx-auto max-w-[200px] w-full"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {urls.success ? (
                  <Image
                    src={urls.data[0]}
                    alt={item.name}
                    fill
                    sizes="
                      (max-width: 640px) 50vw,
                      (max-width: 1024px) 33vw,
                      25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105 select-none"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <div className="mt-2 space-y-0.5">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </p>

                {item.brand && (
                  <p className="text-xs text-gray-500 truncate">{item.brand}</p>
                )}

                <p className="text-xs text-gray-400">
                  {item.category || "Uncategorized"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      <Pagination
        currentPage={page}
        total={Number(items.data[0]?.total) || 0}
      />
    </div>
  );
}
