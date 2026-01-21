"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";

export function Pagination({
  currentPage,
  total,
}: {
  currentPage: number;
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function goTo(page: number) {
    const p = new URLSearchParams(params);
    p.set("page", String(page));
    router.push(`?${p.toString()}`);
  }

  return (
    <div className="w-fit ml-auto space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="cursor-pointer"
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage * 10 >= total || total === 0}
        className="cursor-pointer"
      >
        Next
      </Button>
    </div>
  );
}
