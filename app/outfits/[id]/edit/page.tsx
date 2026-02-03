import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AuthGate from "@/components/AuthGate";
import { Suspense } from "react";
import { getItems } from "@/actions/items.actions";
import { generateItemImageUrls } from "@/actions/images.actions";
import { ItemFiltersSkeleton } from "@/components/Home/ItemFiltersSkeleton";
import { ItemFiltersContainer } from "@/components/Home/ItemFiltersContainer";
import { Items } from "@/components/Outfits/Edit/Items";
import { getOutfit, getOutfitItemIds } from "@/actions/outfits.actions";

export default async function Edit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { id: outfitId } = await params;
  const searchParams_ = await searchParams;
  let page = Number(searchParams_.page) || 1;
  if (page < 1) {
    page = 1;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <AuthGate />;
  }

  const categoriesParams = buildFiltersDefaultValues(searchParams_.categories);
  const seasonsParams = buildFiltersDefaultValues(searchParams_.seasons);
  const colorsParams = buildFiltersDefaultValues(searchParams_.colors);
  const tagsParams = buildFiltersDefaultValues(searchParams_.tags);

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

  const outfit = await getOutfit({
    userId: session.user.id,
    outfitId: outfitId,
  });
  if (!outfit.success) {
    return <h1>{outfit.error.message}</h1>;
  }

  // Genereate Items Images
  const itemsWithImages = await Promise.all(
    items.data.map(async (item) => {
      const res = await generateItemImageUrls({
        imageKeys: item.image_keys,
      });
      if (res.success) {
        const imageUrls = res.data;
        return { ...item, imageUrls };
      } else {
        return { ...item, imageUrls: null };
      }
    }),
  );

  const existOutfitItemIdsImages = outfit.data.item_ids.map((id, idx) => {
    return {
      id: id,
      imageUrl: outfit.data.primary_image_keys[idx],
    };
  });

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
      <Items
        outfitId={outfit.data.id}
        outfitName={outfit.data.name}
        outfitNote={outfit.data.note}
        items={itemsWithImages}
        existOutfitItemIdsImages={existOutfitItemIdsImages}
        page={page}
      />
    </div>
  );
}

function buildFiltersDefaultValues(
  paramValue: string | undefined,
): string[] | null {
  if (!paramValue || paramValue.length === 0) {
    return null;
  }
  return paramValue.split(",");
}
