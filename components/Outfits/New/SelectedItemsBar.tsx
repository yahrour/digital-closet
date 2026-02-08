"use client";

import { XIcon } from "lucide-react";
import Image from "next/image";
import CreateOutfitDialog from "./CreateOutfitDialog";
import { selectedItemType } from "./Items";

export function SelectedItemsBar({
  selectedItems,
  setSelectedItems,
}: {
  selectedItems: selectedItemType[];
  setSelectedItems: React.Dispatch<React.SetStateAction<selectedItemType[]>>;
}) {
  const handleRemoveItem = (itemId: number) => {
    setSelectedItems((prev) =>
      prev.filter((existItem) => existItem.id != itemId)
    );
  };

  return (
    <div className="flex max-sm:flex-wrap items-center gap-3 max-w-[1050px] mx-auto">
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
        <CreateOutfitDialog
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
        />
      </div>
    </div>
  );
}
