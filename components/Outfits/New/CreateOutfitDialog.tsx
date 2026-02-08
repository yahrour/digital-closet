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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { newOutfitSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { selectedItem } from "./Items";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { createNewOutfit } from "@/actions/outfits.actions";

export type newOutfitSchemaType = z.infer<typeof newOutfitSchema>;

export default function CreateOutfitDialog({
  selectedItems,
  setSelectedItems,
}: {
  selectedItems: selectedItem[];
  setSelectedItems: React.Dispatch<React.SetStateAction<selectedItem[]>>;
}) {
  const selectedItemIds: number[] = selectedItems?.map((item) => item.id);
  const form = useForm<newOutfitSchemaType>({
    resolver: zodResolver(newOutfitSchema),
    defaultValues: {
      name: "",
      note: "",
      selectedItemIds: selectedItemIds,
    },
  });
  const [open, setOpen] = useState(false);
  const [isPending, setIsPendig] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    form.setValue(
      "selectedItemIds",
      selectedItems.map((item) => item.id),
    );
  }, [selectedItems]);

  const handleSubmit = async (formData: newOutfitSchemaType) => {
    setIsPendig(true);
    const session = await authClient.getSession();
    if (!session.data?.user) {
      setIsPendig(false);
      redirect("/signIn");
    }

    const result = await createNewOutfit({formData});

    setIsPendig(false);

    if (!result.success) {
      setError(result.error.message);
    } 
    
    setIsPendig(false);
    form.reset();
    setSelectedItems([]);
    setOpen(false);
    redirect("/outfits");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setError(null);
    form.clearErrors();
    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" className="cursor-pointer">
            Create Outfit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Create Outfit</DialogTitle>
            <DialogDescription>
              Select at least one item. Then name the outfit and add a note.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="name"
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </Field>
            <Field>
              <Controller
                name="note"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="note">Note</FieldLabel>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="note"
                      autoComplete="off"
                      className="max-h-[200px]"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </Field>
          </FieldGroup>
          <div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            {form.formState.errors.selectedItemIds?.message && <p className="text-red-500 text-xs">{form.formState.errors.selectedItemIds?.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  disabled={isPending}
                >
                  Cancel
                </Button>
              }
            />
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
