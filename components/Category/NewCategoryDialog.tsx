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
import { newCategorySchema } from "@/schemas";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { FieldError } from "@/components/ui/field";
import { createNewCategory } from "@/actions/db";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export function NewCategoryDialog({ categoryName }: { categoryName: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<{
    message: string | undefined;
    success: boolean;
  } | null>(null);
  const [isPending, setIsPendig] = useState(false);

  const handleCreateCategory = async () => {
    const { data, success, error } = newCategorySchema.safeParse({
      name: inputRef.current?.value.toLocaleLowerCase(),
    });
    if (!success) {
      const errorObj = JSON.parse(error.message);
      setMessage({
        message: errorObj[0].message,
        success: false,
      });
      return;
    }
    setIsPendig(true);
    const session = await authClient.getSession();
    if (!session.data) {
      redirect("/signIn");
    }
    const result = await createNewCategory({
      user_id: session.data.user.id,
      name: data.name,
    });
    if (!result.success) {
      setMessage({
        message: result.error.message,
        success: false,
      });
    } else {
      setMessage({ message: "Category created successfully", success: true });
    }
    setIsPendig(false);
  };

  return (
    <Dialog>
      <DialogTrigger className="flex-1 flex items-center justify-center gap-2 text-sm border h-fit px-4 py-2 cursor-pointer">
        <Plus size={16} /> <span>New Category</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>New Category</DialogTitle>
          <DialogDescription>
            Create a category to organize your garments.
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
            {message && !message.success && <FieldError errors={[message]} />}
            {message && message.success && (
              <p className="text-green-500 text-xs font-normal">
                {message.message}
              </p>
            )}
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
