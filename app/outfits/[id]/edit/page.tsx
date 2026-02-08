import AuthGate from "@/components/AuthGate";
import { ItemFiltersContainer } from "@/components/Home/ItemFiltersContainer";
import { ItemFiltersSkeleton } from "@/components/Home/ItemFiltersSkeleton";
import { OutfitItemSelector } from "@/components/Outfits/Edit/OutfitItemSelector";
import { OutfitItemSelectorSkeleton } from "@/components/Outfits/New/OutfitItemSelectorSkeleton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";

export default async function Edit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { id: outfitId } = await params;
  const searchParams_ = await searchParams;
  let page = Number(searchParams_.page) || 1;
  if (page < 1) {
    page = 1;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <AuthGate />;
  }

  return (
    <div className="space-y-6 w-full mx-auto">
      <Suspense fallback={<ItemFiltersSkeleton />}>
        <ItemFiltersContainer />
      </Suspense>
      <Suspense fallback={<OutfitItemSelectorSkeleton />}>
        <OutfitItemSelector
          userId={session.user.id}
          outfitId={outfitId}
          page={page}
          paramsCategories={buildFiltersDefaultValues(searchParams_.categories)}
          paramsSeasons={buildFiltersDefaultValues(searchParams_.seasons)}
          paramsColors={buildFiltersDefaultValues(searchParams_.colors)}
          paramsTags={buildFiltersDefaultValues(searchParams_.tags)}
        />
      </Suspense>
    </div>
  );
}

function buildFiltersDefaultValues(
  paramValue: string | undefined
): string[] | null {
  if (!paramValue || paramValue.length === 0) {
    return null;
  }
  return paramValue.split(",");
}
