import AuthGate from "@/components/AuthGate";
import { ItemFiltersContainer } from "@/components/Home/ItemFiltersContainer";
import { ItemFiltersSkeleton } from "@/components/Home/ItemFiltersSkeleton";
import { OutfitItemSelector } from "@/components/Outfits/New/OutfitItemSelector";
import { OutfitItemSelectorSkeleton } from "@/components/Outfits/New/OutfitItemSelectorSkeleton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";

export default async function New({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  let page = Number(params.page) || 1;
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
          page={page}
          paramsCategories={buildFiltersDefaultValues(params.categories)}
          paramsSeasons={buildFiltersDefaultValues(params.seasons)}
          paramsColors={buildFiltersDefaultValues(params.colors)}
          paramsTags={buildFiltersDefaultValues(params.tags)}
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
