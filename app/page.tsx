import Home from "@/components/Home/Home";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <Home />
      </Suspense>
    </div>
  );
}
