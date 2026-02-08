"use client";

import { deleteUnusedTags } from "@/actions/tags.actions";
import { Trash } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";

export function DeleteUnusedTags() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleDeleteUnusedTags = async () => {
    setIsPending(true);
    const res = await deleteUnusedTags();
    setIsPending(false);
    if (!res.success) {
      setError(res.error.message);
    }
    setError(null);
    redirect("/");
  };

  return (
    <div className="max-w-xl flex flex-col justify-end">
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <Button
        variant="destructive"
        className="w-fit self-end bg-red-100 hover:bg-red-200 transition duration-200 px-6 text-sm text-red-500 cursor-pointer"
        onClick={handleDeleteUnusedTags}
        disabled={isPending}
      >
        {isPending ? (
          "Deleting..."
        ) : (
          <>
            <Trash size={16} /> Delete
          </>
        )}
      </Button>
    </div>
  );
}
