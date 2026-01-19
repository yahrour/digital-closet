"use client";

import {
  categoryUsageCounts,
  deleteUserCategory,
  renameUserCategory,
} from "@/actions/db";
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
import { renameCategorySchema } from "@/schemas";
import { FieldError } from "@base-ui/react";

export default function CategoryTable({
  categories,
}: {
  categories: categoryUsageCounts[];
}) {
  return (
    <Table className="min-h-[370px]">
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Usage Count</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell>{category.usageCount}</TableCell>
            <TableCell className="flex justify-end items-center gap-4">
              <Confirm categoryId={category.id} userId={category.user_id} />
              <Rename
                categoryId={category.id}
                categoryName={category.name}
                userId={category.user_id}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function Confirm({
  categoryId,
  userId,
}: {
  categoryId: number;
  userId: string;
}) {
  const [message, setMessage] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteUserCategory({
      category_id: categoryId,
      user_id: userId,
    });
    if (!result.success) {
      setMessage({ message: result.error.message, success: false });
    }
    setLoading(false);
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger className="flex items-center justify-center gap-1 text-red-500 cursor-pointer">
        <Trash size={16} /> Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            category.
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

function Rename({
  userId,
  categoryId,
  categoryName,
}: {
  userId: string;
  categoryId: number;
  categoryName: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const handleRename = async () => {
    setLoading(true);
    const { data, success, error } = renameCategorySchema.safeParse({
      name: inputRef.current?.value,
    });

    if (!success) {
      const parsedError = JSON.parse(error.message);
      setMessage({ message: parsedError[0].message, success: false });
      setLoading(false);
      return;
    }

    const result = await renameUserCategory({
      user_id: userId,
      category_id: categoryId,
      newName: data.name,
    });

    if (!result.success) {
      setMessage({ message: result.error.message, success: false });
    }
    setMessage({ message: "Category renamed successfully", success: true });
    setLoading(false);
  };

  return (
    <Dialog>
      <form>
        <DialogTrigger className="flex items-center justify-center gap-1 cursor-pointer">
          <Pencil size={16} /> Rename
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename category</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" ref={inputRef} defaultValue={categoryName} />
            {!message?.success && (
              <p className="text-red-500 text-xs">{message?.message}</p>
            )}
            {message?.success && (
              <p className="text-green-500 text-xs">{message.message}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose className="cursor-pointer" disabled={loading}>
              Cancel
            </DialogClose>
            <Button
              onClick={handleRename}
              className="cursor-pointer"
              disabled={loading}
            >
              {loading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
