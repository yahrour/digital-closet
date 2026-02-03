"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";
import { deleteOutfit } from "@/actions/outfits.actions";
import { redirect } from "next/navigation";

export function DeleteOutfit({
  outfitId,
  userId,
}: {
  outfitId: number;
  userId: string;
}) {
  const [message, setMessage] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteOutfit({
      outfitId: outfitId,
      userId: userId,
    });
    setLoading(false);
    if (!result.success) {
      setMessage({ message: result.error.message, success: false });
    } else {
      redirect("/outfits");
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger className="flex items-center justify-center gap-1 bg-red-100 hover:bg-red-200 transition duration-200 px-6 text-sm text-red-500 cursor-pointer">
        <Trash size={16} /> Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently deleted.
          </AlertDialogDescription>
          {!message?.success && (
            <p className="text-red-500 text-xs">{message?.message}</p>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            variant="destructive"
            className="cursor-pointer"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
