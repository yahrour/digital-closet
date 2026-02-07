"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FieldError } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { createNewCategory } from "@/actions/categories.actions";
import { categoryNameSchema } from "@/schemas";

export function NewCategoryDialog({ categoryName }: { categoryName: string }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPendig] = useState(false);

  const handleCreateCategory = async () => {
    const { data, success, error } = categoryNameSchema.safeParse({
      name: inputRef.current?.value.toLocaleLowerCase(),
    });
    if (!success) {
      const errorObj = JSON.parse(error.message);
      setError(errorObj[0].message);
      return;
    }
    setIsPendig(true);
    const session = await authClient.getSession();
    if (!session.data) {
      redirect("/signIn");
    }
    const result = await createNewCategory({
      userId: session.data.user.id,
      name: data.name,
    });
    if (!result.success) {
      setError(result.error.message);
    }
    setIsPendig(false);
    setError(null);
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
      setIsPendig(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="flex-1 flex items-center justify-center gap-2 text-sm border h-fit px-4 py-2 cursor-pointer">
        <Plus size={16} /> <span>New Category</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>New Category</DialogTitle>
          <DialogDescription>
            Create a category to organize your items.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="name-1">Category name</Label>
          <Input
            ref={inputRef}
            id="name-1"
            name="name"
            placeholder="e.g. Tops, Outerwear, Shoes"
            defaultValue={categoryName}
          />
          <div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <DialogClose className="cursor-pointer">Cancel</DialogClose>
          <Button
            type="submit"
            className="cursor-pointer"
            onClick={handleCreateCategory}
            disabled={isPending}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
