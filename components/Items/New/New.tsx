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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

import { getUserCategories } from "@/actions/categories.actions";
import { addNewItem } from "@/actions/items.actions";
import { NewItemImagesPreview } from "@/components/Items/New/NewItemImagesPreview";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { colorsType, seasonsType } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { newItemFormSchema } from "@/schemas";
import { useUploadFiles } from "@better-upload/client";
import { XIcon } from "lucide-react";
import { redirect } from "next/navigation";

export type newItemFormSchemaType = z.infer<typeof newItemFormSchema>;

export function New() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const form = useForm<newItemFormSchemaType>({
    resolver: zodResolver(newItemFormSchema),
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
      images: [],
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  useEffect(() => {
    const func = async () => {
      const result = await getUserCategories();
      if (result.success) {
        setCategories(result.data);
      } else {
        setError(result.error.message);
      }
      setIsLoadingCategories(false);
    };
    setError(null);
    func();
  }, []);

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

    form.setValue("tags", [...currentTags, tag.toLocaleLowerCase()]);
    form.setValue("tagInput", "");
    form.clearErrors("tagInput");
  };

  const handleDeleteTag = (tag: string) => {
    const newTags = form.getValues("tags")?.filter((t) => tag !== t);
    form.setValue("tags", newTags);
  };

  const onSubmit = async (formData: newItemFormSchemaType) => {
    setIsPendig(true);

    const session = await authClient.getSession();
    if (!session.data) {
      redirect("/singIn");
    }

    const { files } = await uploader.upload(formData.images);
    const images: string[] = [];
    files.map((file) => images.push(file.objectInfo.key));

    if (images.length === 0) {
      setError("Image upload failed. Please try again.");
      return;
    }

    const data = {
      name: formData.name,
      brand: formData.brand,
      seasons: formData.seasons,
      category: formData.category,
      tags: formData.tags,
      primaryColor: formData.primaryColor,
      secondaryColors: formData.secondaryColors,
      images,
    };

    const result = await addNewItem({
      formData: data,
    });

    setIsPendig(false);
    if (result.success) {
      form.reset();
      uploader.reset();
      redirect("/");
    } else {
      setError(result.error.message);
    }
  };

  const uploader = useUploadFiles({
    route: "form",
    onUploadProgress: () => {
      setUploadProgress(uploader.averageProgress * 100);
    },
    onError: (error) => {
      form.setError("images", {
        message: error.message || "An error occurred.",
      });
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 w-full max-w-125 mx-auto"
    >
      <FieldSet className="w-full">
        <FieldLegend className="md:text-2xl! max-md:text-xl!">
          Add Item
        </FieldLegend>
        <FieldDescription className="md:text-base">
          Add a new item to your digital closet with its details and image(s).
        </FieldDescription>
        <FieldGroup>
          <div className="space-y-2">
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
              name="brand"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="brand">Brand</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id="brand"
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
          </div>
          <div className="space-y-2">
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
              name="category"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category">Category</FieldLabel>
                  {isLoadingCategories ? (
                    <div className="h-9 bg-gray-200 animate-pulse"></div>
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
            <div
              className={
                (form.getValues("tags")?.length ?? 0) > 0 ? "space-y-1" : ""
              }
            >
              <Controller
                name="tagInput"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <div className="flex items-end gap-4 w-full">
                      <Field
                        className="flex-1"
                        data-invalid={fieldState.invalid}
                      >
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
              <div className="flex flex-wrap gap-1">
                {form.watch("tags")?.map((tag) => (
                  <Badge
                    key={tag}
                    className="group inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-3 text-sm font-medium select-none transition-colors hover:bg-primary/20"
                  >
                    <span className="truncate">{tag}</span>

                    <button
                      onClick={() => handleDeleteTag(tag)}
                      className="ml-0.5 inline-flex items-center justify-center rounded-full p-1 text-primary/60 transition hover:bg-red-500/10 hover:text-red-500"
                    >
                      <XIcon size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
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
                        id="primaryColor"
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
                    Secondary Color(s)
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

            <div>
              <Controller
                name="images"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="images">Image(s)</FieldLabel>

                    {form.getValues("images").length > 0 ? (
                      <NewItemImagesPreview form={form} />
                    ) : (
                      <UploadDropzone
                        id="images"
                        control={uploader.control}
                        description={{
                          maxFiles: 2,
                          maxFileSize: "5MB",
                        }}
                        uploadOverride={(files) => {
                          field.onChange(Array.from(files));
                        }}
                      />
                    )}

                    {/* )} */}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {uploadProgress > 0 && (
                <Progress value={uploadProgress} className="mt-1 w-full" />
              )}
            </div>
          </div>
        </FieldGroup>
      </FieldSet>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <Button
        disabled={!form.formState.isDirty || isPending || uploader.isPending}
        type="submit"
        className="w-full cursor-pointer"
      >
        Save
      </Button>
    </form>
  );
}
