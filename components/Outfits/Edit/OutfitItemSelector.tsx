import { generateItemImageUrls } from "@/actions/images.actions";
import { getItems } from "@/actions/items.actions";
import { getOutfit } from "@/actions/outfits.actions";
import { Items } from "@/components/Outfits/Edit/Items";

type propsType = {
  userId: string;
  outfitId: string;
  page: number;
  paramsCategories: string[] | null;
  paramsSeasons: string[] | null;
  paramsColors: string[] | null;
  paramsTags: string[] | null;
};

export async function OutfitItemSelector({
  userId,
  outfitId,
  page,
  paramsCategories,
  paramsSeasons,
  paramsColors,
  paramsTags,
}: propsType) {
  const items = await getItems({
    userId,
    categories: paramsCategories,
    seasons: paramsSeasons,
    colors: paramsColors,
    tags: paramsTags,
    page,
  });

  if (!items.success) {
    return <h1>{items.error.message}</h1>;
  }

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

  const outfit = await getOutfit({
    userId: userId,
    outfitId: outfitId,
  });
  if (!outfit.success) {
    return <h1>{outfit.error.message}</h1>;
  }

  const existOutfitItemIdsImages = outfit.data.item_ids.map((id, idx) => {
    return {
      id: id,
      imageUrl: outfit.data.primary_image_keys[idx],
    };
  });

  if (items.data.length === 0) {
    <h1 className="text-xl text-center text-gray-500 w-full">
      Not items found
    </h1>;
  }

  return (
    <Items
      outfitId={outfit.data.id}
      outfitName={outfit.data.name}
      outfitNote={outfit.data.note}
      items={itemsWithImages}
      existOutfitItemIdsImages={existOutfitItemIdsImages}
      page={page}
    />
  );
}
