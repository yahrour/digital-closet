"use client";

import { itemsType } from "@/actions/items.actions";
import { ColorDot } from "@/components/ColorDot";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SelectedItemsBar } from "./SelectedItemsBar";
import { Pagination } from "@/components/Pagination";

type itemsWithImageUrls = itemsType & {
  imageUrls: string[] | null;
};
export type selectedItem = {
  id: number;
  imageUrl: string | null;
};

export function Items({
  items,
  page,
}: {
  items: itemsWithImageUrls[];
  page: number;
}) {
  const [selectedItems, setSelectedItems] = useState<selectedItem[]>([]);

  const toggleSelectItem = (item: selectedItem) => {
    setSelectedItems((prev) =>
      prev.some((existItem) => existItem.id === item.id)
        ? prev.filter((existItem) => existItem.id !== item.id)
        : [...prev, item],
    );
  };

  return (
    <div className="space-y-6">
      <SelectedItemsBar
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center items-center">
        {items.map((item) => {
          return (
            <Item
              key={item.id}
              item={item}
              selectedItems={selectedItems}
              toggleSelectItem={toggleSelectItem}
            />
          );
        })}
      </div>
      <Pagination
        currentPage={page}
        total={Number(items[0]?.total) || 0}
        limit={4}
      />
    </div>
  );
}

function Item({
  item,
  toggleSelectItem,
  selectedItems,
}: {
  item: itemsWithImageUrls;
  selectedItems: selectedItem[];
  toggleSelectItem: (item: selectedItem) => void;
}) {
  return (
    <div
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
            loading="eager"
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
            <p className="text-xs text-gray-500 truncate">{item.brand}</p>
          )}

          <p className="text-xs text-gray-400">
            {item.category || "Uncategorized"}
          </p>
        </div>
        <div className="flex flex-col justify-end items-end">
          <div className="space-x-0.5">
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
}
