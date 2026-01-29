import Home from "@/components/Home/Home";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <Home searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
