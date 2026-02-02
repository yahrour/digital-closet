import { NewOutfit } from "@/components/Outfits/New/NewOutfit";
import { Suspense } from "react";

export default function New({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <Suspense>
      <NewOutfit searchParams={searchParams} />
    </Suspense>
  );
}
