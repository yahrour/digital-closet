import { AccountDetails } from "@/components/Account/AccountDetails";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react";

export default function Account() {
  return (
    <div className="w-full space-y-10">
      <Suspense fallback={<LoadingSpinner />}>
        <AccountDetails />
      </Suspense>
    </div>
  );
}
