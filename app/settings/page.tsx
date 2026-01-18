import { AccountDetails } from "@/components/Account/AccountDetails";
import LoadingSpinner from "@/components/LoadingSpinner";
import { NewCategoryDialog } from "@/components/NewCategoryDialog";
import { FieldDescription, FieldLegend } from "@/components/ui/field";
import { Suspense } from "react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<LoadingSpinner />}>
        <AccountDetails />
      </Suspense>
      <div className="space-y-2">
        <FieldLegend className="md:text-2xl! max-md:text-xl!">
          New Category
        </FieldLegend>
        <FieldDescription className="md:text-base">
          Create new category
        </FieldDescription>

        <NewCategoryDialog />
      </div>
    </div>
  );
}
