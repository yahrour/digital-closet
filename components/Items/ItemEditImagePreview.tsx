"use client";

import Image from "next/image";
import { ArrowRightLeft, XIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { UseFormReturn } from "react-hook-form";
import { editItemFormSchemaType } from "./ItemEdit";

export function ItemEditImagePreview({
  form,
}: {
  form: UseFormReturn<editItemFormSchemaType>;
}) {
  "use no memo";
  const images = form.watch("imageUrls");
  const imageKeys = form.watch("imageKeys");
  const handleSwitch = () => {
    if (imageKeys && imageKeys.length === 2 && images && images.length === 2) {
      form.setValue("imageKeys", [imageKeys[1], imageKeys[0]], {
        shouldDirty: true,
      });
      form.setValue("imageUrls", [images[1], images[0]], {
        shouldDirty: true,
      });
    }
  };

  const handleDelete = (index: number) => {
    if (images) {
      form.setValue(
        "imageUrls",
        images.filter((_, i) => i !== index),
        { shouldDirty: true },
      );
    }
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] items-center gap-2">
      {/* Primary Image */}
      {images && images[0] && (
        <div className="relative aspect-square overflow-hidden border bg-neutral-50">
          <Image
            src={images[0]}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 320px"
            className="object-cover"
          />
          <Badge
            className="absolute bottom-2 left-2 bg-white/90 select-none"
            variant="outline"
          >
            Primary
          </Badge>
          <Button
            className="absolute right-1 top-1 w-5 h-5 p-4 bg-white text-red-700 cursor-pointer"
            onClick={() => handleDelete(0)}
          >
            <XIcon size={12} />
          </Button>
        </div>
      )}

      {/* Switch Button */}
      {images && images.length === 2 && (
        <Button className="cursor-pointer select-none" onClick={handleSwitch}>
          <ArrowRightLeft size={12} />
        </Button>
      )}

      {/* Secondary Image */}
      {images && images[1] && (
        <div className="relative aspect-square overflow-hidden border bg-neutral-50">
          <Image
            src={images[1]}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 320px"
            className="object-cover"
          />
          <Badge
            className="absolute bottom-2 left-2 bg-white/90 select-none"
            variant="outline"
          >
            Secondary
          </Badge>
          <Button
            className="absolute right-1 top-1 w-5 h-5 p-4 bg-white text-red-700 cursor-pointer"
            onClick={() => handleDelete(1)}
          >
            <XIcon size={12} />
          </Button>
        </div>
      )}
    </div>
  );
}
