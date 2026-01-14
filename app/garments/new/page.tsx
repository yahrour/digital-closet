"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { newGarmentSchema } from "@/schemas";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

import { colorsType, seasonsType } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { addNewGarment, getUserCategories } from "@/actions/db";
import { authClient } from "@/lib/auth-client";

export type newGarmentSchemaType = z.infer<typeof newGarmentSchema>;

export default function New() {
  const form = useForm<newGarmentSchemaType>({
    resolver: zodResolver(newGarmentSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      seasons: [],
      primaryColor: "",
      secondaryColors: [],
      brand: "",
      category: "",
      tags: [],
      tagInput: "",
      imageUrl: "",
    },
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  useEffect(() => {
    const func = async () => {
      const session = await authClient.getSession();
      const result = await getUserCategories({
        user_id: session.data?.user.id,
      });
      setCategories(result ?? []);
      setIsLoadingCategories(false);
    };
    func();
  }, []);

  const [message, setMessage] = useState<{
    message: string | undefined;
    isError: boolean;
  } | null>(null);
  const [isPending, setIsPendig] = useState(false);

  const handleAddTag = () => {
    const tag = form.getValues("tagInput")?.trim();

    if (!tag) {
      form.setError("tagInput", { message: "tag cannot be empty" });
      return;
    }
    if (tag.length > 25) {
      form.setError("tagInput", { message: "tag too long" });
      return;
    }

    const currentTags = form.getValues("tags") ?? [];
    if (currentTags.includes(tag)) {
      form.setError("tagInput", { message: "tag already exist" });
      return;
    }

    form.setValue("tags", [...currentTags, tag]);
    form.setValue("tagInput", "");
    form.clearErrors("tagInput");
  };

  const onSubmit = async (formData: newGarmentSchemaType) => {
    setIsPendig(true);
    await addNewGarment(formData);
    setIsPendig(false);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 w-full max-w-125"
    >
      <FieldSet className="w-full">
        <FieldLegend className="md:text-2xl! max-md:text-xl!">
          Add Garment
        </FieldLegend>
        <FieldDescription className="md:text-base">
          Add a new item to your digital closet with its details and image.
        </FieldDescription>
        <FieldGroup>
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
                  placeholder="John Doe"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="seasons"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="seasons">Season(s)</FieldLabel>

                <MultiSelect
                  values={field.value}
                  onValuesChange={field.onChange}
                >
                  <MultiSelectTrigger className="flex-1">
                    <MultiSelectValue
                      id="seasons"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      overflowBehavior="cutoff"
                      placeholder="Season(s)"
                    />
                  </MultiSelectTrigger>
                  <MultiSelectContent>
                    <MultiSelectGroup>
                      {seasonsType?.map((season) => (
                        <MultiSelectItem key={season} value={season}>
                          {season}
                        </MultiSelectItem>
                      ))}
                    </MultiSelectGroup>
                  </MultiSelectContent>
                </MultiSelect>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="primaryColor"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="primaryColor">Primary Color</FieldLabel>
                <MultiSelect
                  single
                  values={field.value ? [field.value] : []}
                  onValuesChange={(values) => {
                    field.onChange(values[0] ?? "");
                  }}
                >
                  <MultiSelectTrigger className="flex-1">
                    <MultiSelectValue
                      id="primaryColors"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      overflowBehavior="cutoff"
                      placeholder="Colors"
                    />
                  </MultiSelectTrigger>
                  <MultiSelectContent>
                    <MultiSelectGroup>
                      {colorsType?.map((color) => (
                        <MultiSelectItem key={color} value={color}>
                          {color}
                        </MultiSelectItem>
                      ))}
                    </MultiSelectGroup>
                  </MultiSelectContent>
                </MultiSelect>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="secondaryColors"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="secondaryColors">
                  Secondary Colors
                </FieldLabel>
                <MultiSelect
                  values={field.value}
                  onValuesChange={field.onChange}
                >
                  <MultiSelectTrigger
                    id="secondaryColors"
                    {...field}
                    aria-invalid={fieldState.invalid}
                    className="flex-1"
                  >
                    <MultiSelectValue
                      overflowBehavior="cutoff"
                      placeholder="Colors"
                    />
                  </MultiSelectTrigger>
                  <MultiSelectContent>
                    <MultiSelectGroup>
                      {colorsType?.map((color) => (
                        <MultiSelectItem key={color} value={color}>
                          {color}
                        </MultiSelectItem>
                      ))}
                    </MultiSelectGroup>
                  </MultiSelectContent>
                </MultiSelect>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="brand"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="brand">Brand</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="brand"
                  value={undefined}
                  type="text"
                  autoComplete="off"
                  placeholder="levi's"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="category"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                {isLoadingCategories ? (
                  <div className="h-9 bg-gray-200 animate-pulse "></div>
                ) : (
                  <MultiSelect
                    single
                    values={field.value ? [field.value] : []}
                    onValuesChange={(values) => {
                      field.onChange(values[0] ?? "");
                    }}
                  >
                    <MultiSelectTrigger className="flex-1">
                      <MultiSelectValue
                        id="category"
                        {...field}
                        aria-invalid={fieldState.invalid}
                        overflowBehavior="cutoff"
                        placeholder="Categories"
                      />
                    </MultiSelectTrigger>
                    <MultiSelectContent className="w-full">
                      <MultiSelectGroup>
                        {categories?.map((category) => (
                          <MultiSelectItem key={category} value={category}>
                            {category}
                          </MultiSelectItem>
                        ))}
                      </MultiSelectGroup>
                    </MultiSelectContent>
                  </MultiSelect>
                )}
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="space-y-2">
            <Controller
              name="tagInput"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <div className="flex items-end gap-4 w-full">
                    <Field className="flex-1" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="tags">Tags</FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        id="tags"
                        type="text"
                        autoComplete="off"
                        placeholder="Tags: dress, linen, formal…"
                      />
                    </Field>
                    <Button
                      variant="secondary"
                      className="cursor-pointer px-4 py-2"
                      onClick={handleAddTag}
                    >
                      Add
                    </Button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </>
              )}
            />

            <div className="flex gap-2">
              {form.watch("tags")?.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>

          <Controller
            name="imageUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="image">Image</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="image"
                  value={undefined}
                  type="text"
                  autoComplete="off"
                  placeholder=""
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <div>
        {message && message.isError && <FieldError errors={[message]} />}
        {message && !message.isError && (
          <p className="text-green-500 text-xs font-normal">
            {message.message}
          </p>
        )}
      </div>

      <Button
        disabled={!form.formState.isDirty || isPending}
        type="submit"
        className="w-full cursor-pointer"
      >
        Save
      </Button>
    </form>
  );
}
