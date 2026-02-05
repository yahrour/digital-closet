import { generateItemImageUrls } from "@/actions/images.actions";
import { getItems } from "@/actions/items.actions";
import { Items } from "./Items";

type propsType = {
  userId: string;
  page: number;
  paramsCategories: string[] | null;
  paramsSeasons: string[] | null;
  paramsColors: string[] | null;
  paramsTags: string[] | null;
};
export async function OutfitItemSelector({
  userId,
  page,
  paramsCategories,
  paramsSeasons,
  paramsColors,
  paramsTags,
}: propsType) {
  const items = await getItems({
    userId: userId,
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

  return <Items items={itemsWithImages} page={page} />;
}
