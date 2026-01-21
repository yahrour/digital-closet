import { AccountDetails } from "@/components/Account/AccountDetails";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react";

export default function Account() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AccountDetails />
    </Suspense>
  );
}
