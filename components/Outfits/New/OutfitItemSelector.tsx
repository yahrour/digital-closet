import { generateItemImageUrls } from "@/actions/images.actions";
import { getItems } from "@/actions/items.actions";
import { Items } from "./Items";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

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

  if (items.data.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 mt-6 mx-auto">
        <div>
          <h1 className="text-base text-center text-gray-800">
            Your closet is empty
          </h1>
          <p className="text-sm text-center text-gray-400">
            Add a few pieces to your closet to start building outfits.
          </p>
        </div>
        <Link href="/items/new">
          <Button variant="outline" className="cursor-pointer">
            Add Item <Plus />
          </Button>
        </Link>
      </div>
    )
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
