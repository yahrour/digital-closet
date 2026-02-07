"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";

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

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRef, useState } from "react";
import {
  categoryUsageCount,
  deleteUserCategory,
  renameUserCategory,
} from "@/actions/categories.actions";
import { categoryNameSchema } from "@/schemas";

export default function CategoryTable({
  categories,
}: {
  categories: categoryUsageCount[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Usage Count</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="h-fit">
        {categories.map((category) => (
          <TableRow
            key={category.id}
            className="min-sm:h-[50px] max-sm:h-[40px]"
          >
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell>{category.usageCount}</TableCell>
            <TableCell className="flex justify-end items-center gap-4 min-sm:h-[50px] max-sm:h-[40px]">
              <Delete categoryId={category.id} userId={category.userId} />
              <Rename
                categoryId={category.id}
                categoryName={category.name}
                userId={category.userId}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function Delete({
  categoryId,
  userId,
}: {
  categoryId: number;
  userId: string;
}) {
  const [error, setError] = useState<string |null>(null);
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteUserCategory({
      categoryId: categoryId,
      userId: userId,
    });
    if (!result.success) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger className="flex items-center justify-center gap-1 text-red-500 cursor-pointer">
        <Trash size={16} /> <span className="max-sm:hidden">Delete</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            category.
          </AlertDialogDescription>
          {error && 
            <p className="text-red-500 text-xs">{error}</p>
          }
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

function Rename({
  userId,
  categoryId,
  categoryName,
}: {
  userId: string;
  categoryId: number;
  categoryName: string;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPendig, setIsPendig] = useState(false);
  const handleRename = async () => {
    setIsPendig(true);

    const { data, success, error } = categoryNameSchema.safeParse({
      name: inputRef.current?.value,
    });

    if (categoryName.toLocaleLowerCase() === data?.name.toLocaleLowerCase()) {
      setError("Nothing changed");
      setIsPendig(false);
      return;
    }

    if (!success) {
      const parsedError = JSON.parse(error.message);
      setError(parsedError[0].message);
      setIsPendig(false);
      return;
    }

    const result = await renameUserCategory({
      userId: userId,
      categoryId: categoryId,
      newName: data.name,
    });

    if (!result.success) {
      setError(result.error.message);
    }
    setIsPendig(false);
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
      <DialogTrigger className="flex items-center justify-center gap-1 cursor-pointer">
        <Pencil size={16} /> <span className="max-sm:hidden">Rename</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename category</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" ref={inputRef} defaultValue={categoryName} />
          {error &&
            <p className="text-red-500 text-xs">{error}</p>
          }
        </div>

        <DialogFooter>
          <DialogClose className="cursor-pointer" disabled={isPendig}>
            Cancel
          </DialogClose>
          <Button
            onClick={handleRename}
            className="cursor-pointer"
            disabled={isPendig}
          >
            {isPendig ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
