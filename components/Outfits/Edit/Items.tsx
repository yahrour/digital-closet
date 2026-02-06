"use client";

import { itemsType } from "@/actions/items.actions";
import { ColorDot } from "@/components/ColorDot";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import SaveOutfitDialog from "./SaveOutfitDialog";
import { Pagination } from "@/components/Pagination";

type itemsWithImageUrls = itemsType & {
  imageUrls: string[] | null;
};
export type selectedItem = {
  id: number;
  imageUrl: string | null;
};

export function Items({
  outfitId,
  outfitName,
  outfitNote,
  items,
  existOutfitItemIdsImages,
  page,
}: {
  outfitId: number;
  outfitName: string;
  outfitNote: string;
  items: itemsWithImageUrls[];
  existOutfitItemIdsImages: selectedItem[];
  page: number;
}) {
  const [selectedItems, setSelectedItems] = useState<selectedItem[]>([]);

  useEffect(() => {
    setSelectedItems(existOutfitItemIdsImages);
  }, []);

  const toggleSelectItem = (item: selectedItem) => {
    setSelectedItems((prev) =>
      prev.some((existItem) => existItem.id === item.id)
        ? prev.filter((existItem) => existItem.id !== item.id)
        : [...prev, item],
    );
  };

  const handleRemoveItem = (itemId: number) => {
    console.log("remove: ", itemId);
    setSelectedItems((prev) =>
      prev.filter((existItem) => existItem.id != itemId),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex max-sm:flex-wrap items-center gap-3">
        <div className="flex gap-2 overflow-x-auto w-fit">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="relative w-12 h-12"
              onClick={() => handleRemoveItem(item.id)}
            >
              {item.imageUrl ? (
                <div className="group">
                  <Image
                    src={item.imageUrl}
                    fill
                    alt=""
                    sizes="48px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center bg-white shadow-md opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 hover:bg-gray-100"
                  >
                    <XIcon size={12} className="text-red-500" />
                  </button>
                </div>
              ) : (
                <span>No Image</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center w-full">
          <span className="h-fit text-sm text-neutral-600">
            {selectedItems.length} selected
          </span>
          <SaveOutfitDialog
            outfitId={outfitId}
            outfitName={outfitName}
            outfitNote={outfitNote}
            existOutfitItemIds={existOutfitItemIdsImages.map((item) => {
              return item.id;
            })}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center items-center">
        {items.map((item) => {
          return (
            <div
              key={item.id}
              className={`group mx-auto max-w-[200px] w-full p-1 ${selectedItems.find((obj) => obj.id === item.id) ? "bg-gray-200" : "hover:bg-gray-100"}`}
              onClick={() =>
                toggleSelectItem({
                  id: item.id,
                  imageUrl: item.imageUrls && item.imageUrls[0],
                })
              }
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {item.imageUrls ? (
                  <Image
                    src={item.imageUrls[0]}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
                    title={item.name}
                    className="text-sm font-medium text-gray-900 truncate max-w-[90px]"
                  >
                    {item.name}
                  </p>

                  {item.brand && (
                    <p className="text-xs text-gray-500 truncate">
                      {item.brand}
                    </p>
                  )}

                  <p className="text-xs text-gray-400">
                    {item.category || "Uncategorized"}
                  </p>
                </div>
                <div className="flex flex-col justify-end items-end">
                  <div className="-space-x-1">
                    <ColorDot color={item.primary_color} />
                    {item.secondary_colors.map((c) => (
                      <ColorDot key={c} color={c} />
                    ))}
                  </div>
                  <Link href={`/items/${item.id}`}>
                    <Button variant="outline" className="cursor-pointer">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Pagination currentPage={page} total={Number(items[0]?.total) || 0} />
    </div>
  );
}
