import { generateItemImageUrls } from "@/actions/images.actions";
import { getItems, itemType } from "@/actions/items.actions";
import AuthGate from "@/components/AuthGate";
import { ActionResult } from "@/lib/actionsType";
import { auth } from "@/lib/auth";
import { Plus } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ColorDot } from "../ColorDot";
import { Pagination } from "../Pagination";
import { Button } from "../ui/button";
import { ItemFiltersContainer } from "./ItemFiltersContainer";
import { ItemFiltersSkeleton } from "./ItemFiltersSkeleton";

function buildFiltersDefaultValues(
  paramValue: string | undefined
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

  const items = await getItems({
    userId: session.user.id,
    categories: buildFiltersDefaultValues(params.categories),
    seasons: buildFiltersDefaultValues(params.seasons),
    colors: buildFiltersDefaultValues(params.colors),
    tags: buildFiltersDefaultValues(params.tags),
    page,
  });

  if (!items.success) {
    return <h1>{items.error.message}</h1>;
  }

  return (
    <div className="space-y-6 w-full mx-auto">
      <Suspense fallback={<ItemFiltersSkeleton />}>
        <ItemFiltersContainer />
      </Suspense>

      {items.data.length > 0 ? (
        <>
          <div className="grid grid-cols-4 max-lg:grid-cols-3 max-sm:grid-cols-2 gap-6 justify-center items-center">
            {items.data?.map(async (item) => {
              const imageUrls = await generateItemImageUrls({
                imageKeys: item.image_keys,
              });
              return <Item key={item.id} item={item} imageUrls={imageUrls} />;
            })}
          </div>
          <Pagination
            currentPage={page}
            total={Number(items.data[0]?.total) || 0}
          />
        </>
      ) : (
        <div className="flex flex-col justify-center items-center gap-4 mt-6 mx-auto">
          <div>
            <h1 className="text-base text-center text-gray-800">
              No items yet
            </h1>
            <p className="text-sm text-center text-gray-400">
              Add your first item to start building your digital closet.
            </p>
          </div>
          <Link href="/items/new">
            <Button variant="outline" className="cursor-pointer">
              New Item <Plus />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function Item({
  item,
  imageUrls,
}: {
  item: itemType;
  imageUrls: ActionResult<string[]>;
}) {
  return (
    <Link
      href={`/items/${item.id}`}
      prefetch={false}
      className="group mx-auto max-w-[200px] w-full"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {imageUrls.success ? (
          <Image
            src={imageUrls.data[0]}
            alt={item.name}
            loading="eager"
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

      <div className="flex justify-between mt-2">
        <div className="space-y-0.5">
          <p
            className="text-sm font-medium text-gray-900 truncate w-[90px]"
            title={item.name}
          >
            {item.name}
          </p>

          {item.brand && (
            <p className="text-xs text-gray-500 truncate">{item.brand}</p>
          )}

          <p className="text-xs text-gray-400">
            {item.category || "Uncategorized"}
          </p>
        </div>
        <div className="flex self-end -space-x-1">
          <ColorDot color={item.primary_color} />
          {item.secondary_colors.map((c) => (
            <ColorDot key={c} color={c} />
          ))}
        </div>
      </div>
    </Link>
  );
}
