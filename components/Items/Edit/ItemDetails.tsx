"use client";

import { deleteItem, itemType } from "@/actions/items.actions";
import Image from "next/image";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export function ItemDetails({
  item,
  imageUrls,
  userId,
}: {
  item: itemType;
  imageUrls: string[];
  userId: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="max-w-md w-full mx-auto space-y-4">
      {/* Images */}
      <div className="space-y-2 max-w-sm mx-auto">
        <div className="relative max-w-md aspect-square overflow-hidden">
          <Image
            src={imageUrls[activeIndex]}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 384px"
            className="object-cover"
          />
        </div>
        {imageUrls.length === 2 && (
          <div className="flex gap-3 overflow-x-auto">
            {imageUrls.map((url, idx) => (
              <button
                key={url}
                className={`relative w-20 h-20 overflow-hidden ${activeIndex === idx ? "border-2 border-gray-400" : ""}`}
                onClick={() => {
                  if (activeIndex !== idx) {
                    setActiveIndex(idx);
                  }
                }}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Identity */}
      <div className="space-y-1 text-center">
        <h1 className="text-lg font-medium">{item.name}</h1>
        <p className="text-xs text-neutral-500">
          {item.brand} · {item.category ?? "Uncategorized"}
        </p>
      </div>

      {/* Attributes */}
      <div className="space-y-6 text-sm max-w-sm mx-auto">
        <Section title="Seasons">
          {item.seasons.map((s) => (
            <Pill key={s}>{s}</Pill>
          ))}
        </Section>

        <Section title="Colors">
          <ColorDot color={item.primary_color} />
          {item.secondary_colors.map((c) => (
            <ColorDot key={c} color={c} />
          ))}
        </Section>

        <Section title="Tags">
          {item.tags.map((tag) => (
            <Pill key={tag.id}>{tag.name}</Pill>
          ))}
        </Section>
      </div>

      {/* Actions */}
      <div className="max-w-sm mx-auto flex gap-2">
        <Link
          href={`/items/${item.id}/edit`}
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 transition duration-200 border px-4 py-1.5"
        >
          <Pencil size={16} />
          Edit
        </Link>
        <Delete itemId={item.id} userId={userId} imageKeys={item.image_keys} />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-neutral-400">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 rounded-full bg-neutral-100 text-xs">
      {children}
    </span>
  );
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-4 w-4 rounded-full border border-neutral-300"
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}

function Delete({
  itemId,
  userId,
  imageKeys,
}: {
  itemId: number;
  userId: string;
  imageKeys: string[];
}) {
  const [message, setMessage] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteItem({
      itemId: itemId,
      userId: userId,
      imageKeys,
    });
    setLoading(false);
    if (!result.success) {
      setMessage({ message: result.error.message, success: false });
    } else {
      redirect("/");
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger className="flex items-center justify-center gap-1 bg-red-100 hover:bg-red-200 transition duration-200 px-4 py-1.5 text-sm text-red-500 cursor-pointer">
        <Trash size={16} /> Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the item.
          </AlertDialogDescription>
          {!message?.success && (
            <p className="text-red-500 text-xs">{message?.message}</p>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            variant="destructive"
            className="cursor-pointer"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
