"use client";

import { updateOutfit } from "@/actions/outfits.actions";
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
import { authClient } from "@/lib/auth-client";
import { newOutfitSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { selectedItem } from "./Items";

export type newOutfitSchemaType = z.infer<typeof newOutfitSchema>;
export default function SaveOutfitDialog({
  outfitId,
  outfitName,
  outfitNote,
  existOutfitItemIds,
  selectedItems,
}: {
  outfitId: number;
  outfitName: string;
  outfitNote: string;
  existOutfitItemIds: number[];
  selectedItems: selectedItem[];
}) {
  const selectedItemIds: number[] = selectedItems?.map((item) => item.id);
  const form = useForm<newOutfitSchemaType>({
    resolver: zodResolver(newOutfitSchema),
    defaultValues: {
      name: outfitName,
      note: outfitNote,
      selectedItemIds: selectedItemIds,
    },
  });
  const [isPending, setIsPendig] = useState(false);
  const [message, setMessage] = useState<{
    message: string | undefined;
    success: boolean;
  } | null>(null);

  useEffect(() => {
    form.setValue(
      "selectedItemIds",
      selectedItems.map((item) => item.id)
    );
  }, [selectedItems]);

  const handleSubmit = async (formData: newOutfitSchemaType) => {
    setIsPendig(true);
    const session = await authClient.getSession();
    if (!session.data?.user) {
      setIsPendig(false);
      redirect("/signIn");
    }

    const removedItemIds = existOutfitItemIds.filter(
      (id) => !selectedItemIds.includes(id)
    );

    const result = await updateOutfit({
      formData,
      outfitId,
      removedItemIds,
    });
    setIsPendig(false);

    if (!result.success) {
      setMessage({
        message: result.error.message,
        success: false,
      });
    } else {
      redirect(`/outfits/${outfitId}`);
    }
    setIsPendig(false);
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" className="cursor-pointer">
            Save Outfit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Outfit</DialogTitle>
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
            {message && !message.success && <FieldError errors={[message]} />}
            {message && message.success && (
              <p className="text-green-500 text-xs font-normal">
                {message.message}
              </p>
            )}
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
