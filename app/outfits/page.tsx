import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOutfits, outfit } from "@/actions/outfits.actions";
import Link from "next/link";
import Image from "next/image";
import AuthGate from "@/components/AuthGate";
import { Pagination } from "@/components/Pagination";

export default async function ShowOutfits({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  let page = Number((await searchParams).page) || 1;
  if (page < 1) {
    page = 1;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <AuthGate />;
  }

  const outfits = await getOutfits({ userId: session.user.id, page });
  if (!outfits.success) {
    return <div>{outfits.error.message}</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-6 justify-center items-center">
        {outfits.data.map((outfit) => (
          <Outfit key={outfit.id} outfit={outfit} />
        ))}
      </div>
      <Pagination
        currentPage={page}
        total={Number(outfits.data[0]?.total) || 0}
      />
    </div>
  );
}

function Outfit({ outfit }: { outfit: outfit }) {
  const containerSize = 200;
  const offsetMultiplier = containerSize * 0.024;

  return (
    <Link
      href={`/outfits/${outfit.id}`}
      prefetch={false}
      className="group inline-block space-y-8 w-fit mx-auto"
    >
      <div
        className="relative mx-auto"
        style={{ width: "200px", height: "200px" }}
      >
        {outfit.primary_image_keys.length > 0 ? (
          outfit.primary_image_keys.slice(0, 3).map((url, idx) => (
            <div
              key={url}
              className="absolute"
              style={{
                width: "200px",
                height: "200px",
                transform: `translate(${idx * offsetMultiplier}px, ${idx * offsetMultiplier}px) rotate(${idx === 0 ? 0 : idx * 2}deg)`,
                zIndex: 10 - idx,
                left: 0,
                top: 0,
              }}
            >
              <div className="relative w-full h-full overflow-hidden rounded">
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover shadow-md"
                  loading="eager"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400 border border-neutral-200 rounded">
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
