import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main>{children}</main>
    </Suspense>
  );
}
