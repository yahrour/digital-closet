import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOutfits, outfit } from "@/actions/outfits.actions";
import Link from "next/link";
import Image from "next/image";
import AuthGate from "@/components/AuthGate";

export default async function ShowOutfits() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <AuthGate />;
  }

  const outfits = await getOutfits(session.user.id);
  if (!outfits.success) {
    return <div>{outfits.error.message}</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap gap-10 mx-auto">
        {outfits.data.map((outfit) => (
          <Outfit key={outfit.id} outfit={outfit} />
        ))}
      </div>
    </div>
  );
}

function Outfit({ outfit }: { outfit: outfit }) {
  return (
    <Link
      href={`/outfits/${outfit.id}`}
      prefetch={false}
      className="group inline-block space-y-8"
    >
      <div className="relative w-[250px] h-[250px]">
        {outfit.primary_image_keys.length > 0 ? (
          outfit.primary_image_keys.slice(0, 3).map((url, idx) => (
            <div
              key={url}
              className="absolute inset-0"
              style={{
                transform: `translate(${idx * 6}px, ${idx * 6}px) rotate(${idx === 0 ? 0 : idx * 2}deg)`,
                zIndex: 10 - idx,
              }}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="250px"
                className="object-cover rounded-md shadow-sm"
              />
            </div>
          ))
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            No images
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium text-neutral-900">
          {outfit.name}
        </h3>
        <p className="text-xs text-neutral-500">
          {outfit.item_ids.length} items
        </p>
      </div>
    </Link>
  );
}
