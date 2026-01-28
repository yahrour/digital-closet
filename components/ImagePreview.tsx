"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowRightLeft, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { newGarmentFormSchemaType } from "@/app/items/new/page";

export function ImagePreview({
  form,
}: {
  form: UseFormReturn<newGarmentFormSchemaType>;
}) {
  "use no memo";
  const images = form.watch("images");
  const imagesUrlRef = useRef<string[]>([]);
  const [imagesUrl, setImagesUrl] = useState<string[]>([]);

  useEffect(() => {
    const urls = images.map((image) => URL.createObjectURL(image));
    imagesUrlRef.current = urls;
    setImagesUrl(imagesUrlRef.current);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleSwitch = () => {
    if (images.length === 2) {
      form.setValue("images", [images[1], images[0]], { shouldDirty: true });
    }
  };

  const handleDelete = (index: number) => {
    form.setValue(
      "images",
      images.filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] items-center gap-2">
      {/* Primary Image */}
      {images[0] && imagesUrl[0] && (
        <div className="relative aspect-square overflow-hidden border bg-neutral-50">
          <Image
            src={imagesUrl[0]}
            alt={images[0].name}
            fill
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
      {form.getValues("images").length === 2 && (
        <Button className="cursor-pointer select-none" onClick={handleSwitch}>
          <ArrowRightLeft size={12} />
        </Button>
      )}

      {/* Secondary Image */}
      {images[1] && imagesUrl[1] && (
        <div className="relative aspect-square overflow-hidden border bg-neutral-50">
          <Image
            src={imagesUrl[1]}
            alt={images[1].name}
            fill
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
