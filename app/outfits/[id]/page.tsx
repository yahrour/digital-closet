import { getOutfit } from "@/actions/outfits.actions";
import AuthGate from "@/components/AuthGate";
import { DeleteOutfit } from "@/components/Outfits/DeleteOutfit";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { MoveLeft } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";

export default async function View({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <AuthGate />;
  }

  const outfit = await getOutfit({ outfitId: id, userId: session.user.id });
  if (!outfit.success) {
    return <h1 className="w-full text-center">Failed to fetch outfit</h1>;
  }
  if (!outfit.data) {
    return <h1 className="w-full text-center">Outfit not found</h1>;
  }

  if (!outfit.data) {
    return (
      <div className="max-w-4xl mx-auto px-4 space-y-10">
        <Link
          href="/outfits"
          className="text-sm text-neutral-500 flex items-center gap-1 cursor-pointer"
        >
          <MoveLeft size={12} /> Back
        </Link>
        <h1 className="text-center text-neutral-500">Outfit not found</h1>
      </div>
    );
  }
  return (
    <div className="w-full mx-auto px-4 space-y-10">
      <Link
        href="/outfits"
        className="text-sm text-neutral-500 flex items-center gap-1 cursor-pointer"
      >
        <MoveLeft size={12} /> Back
      </Link>

      <div className="space-y-1">
        <h1 className="text-xl font-medium text-neutral-900">
          {outfit.data.name}
        </h1>
        {outfit.data.note && (
          <p className="text-sm text-neutral-500 max-w-md">
            {outfit.data.note}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xs uppercase tracking-wide text-neutral-500">
          Items
        </h2>

        <div className="max-w-3xl grid grid-cols-2 sm:grid-cols-3 gap-5">
          {outfit.data.items.map((item, idx) => (
            <div key={outfit.data.item_ids[idx]} className="space-y-2">
              <div className="relative aspect-square bg-neutral-50 overflow-hidden">
                <Image
                  src={outfit.data.primary_image_keys[idx]}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 200px, (min-width: 640px) 30vw, 45vw"
                  className="object-cover"
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-neutral-700 leading-tight truncate max-sm:max-w-[150px]">
                  {item}
                </p>
                <Link href={`/items/${outfit.data.item_ids[idx]}`}>
                  <Button variant="outline" className="cursor-pointer">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl flex justify-end gap-4">
        <Link href={`/outfits/${outfit.data.id}/edit`}>
          <Button variant="outline" className="text-sm cursor-pointer px-6">
            Edit
          </Button>
        </Link>
        <DeleteOutfit outfitId={outfit.data.id} />
      </div>
    </div>
  );
}
