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
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { useUploadFiles } from "@better-upload/client";
import { Progress } from "@/components/ui/progress";
import { getUserCategories } from "@/actions/categories.actions";
import { itemType, updateItem } from "@/actions/items.actions";
import { ExistingItemImagesPreview } from "./ExistingItemImagesPreview";
import { editItemFormSchema } from "@/schemas";
import { XIcon } from "lucide-react";
import { UploadedImagesPreview } from "./UploadedImagesPreview";

export type editItemFormSchemaType = z.infer<typeof editItemFormSchema>;
type itemEditType = itemType & {
  imageUrls: string[];
};

function getDeletedTags(arr1: string[], arr2: string[] | undefined): string[] {
  if (!arr2) {
    return [];
  }
  const deletedTags = arr1.filter((val) => !arr2.includes(val));
  return deletedTags;
}

export default function ItemEdit({
  item,
  userId,
}: {
  item: itemEditType;
  userId: string;
}) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const form = useForm<editItemFormSchemaType>({
    resolver: zodResolver(editItemFormSchema),
    mode: "onSubmit",
    defaultValues: {
      name: item?.name,
      seasons: item?.seasons,
      primaryColor: item?.primary_color,
      secondaryColors: item?.secondary_colors,
      brand: item?.brand,
      category: item?.category,
      tags: item?.tags.map((tag) => tag.name),
      tagInput: "",
      imageKeys: item.image_keys,
      imageUrls: item.imageUrls,
      images: [],
    },
  });
  const existImageUrls = form.watch("imageUrls");
  const uploadedImages = form.watch("images");

  const [message, setMessage] = useState<{
    message: string | undefined;
    success: boolean;
  } | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const func = async () => {
      const result = await getUserCategories({
        user_id: userId,
      });
      if (result.success) {
        setCategories(result.data);
      } else {
        setMessage({
          message: result.error.message,
          success: false,
        });
      }
      setIsLoadingCategories(false);
    };
    setMessage({
      message: undefined,
      success: true,
    });
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
    form.setValue("tags", newTags, { shouldDirty: true });
  };

  const onSubmit = async (formData: editItemFormSchemaType) => {
    const oldTags = item.tags.map((tag) => tag.name);
    const deletedTags = getDeletedTags(oldTags, formData.tags);

    if (existImageUrls?.length === 0 && uploadedImages?.length === 0) {
      form.setError("images", { message: "Upload at least one image." });
    }

    setIsPendig(true);
    const images: string[] = [];

    if (formData.images && formData.images.length > 0) {
      const { files } = await uploader.upload(formData.images);
      files.map((file) => images.push(file.objectInfo.key));
    }

    const data = {
      name: formData.name,
      brand: formData.brand,
      seasons: formData.seasons,
      category: formData.category,
      tags: formData.tags,
      primaryColor: formData.primaryColor,
      secondaryColors: formData.secondaryColors,
      existImageKeys: formData.imageKeys,
      existImages: formData.imageUrls || [],
      newImages: images || [],
    };

    const result = await updateItem({
      user_id: userId,
      item_id: item.id,
      formData: data,
      deletedTags,
    });

    if (result.success) {
      setMessage({
        message: "Item updated successfully",
        success: true,
      });
      setIsPendig(false);
    } else {
      setMessage({
        message: result.error.message,
        success: false,
      });
    }

    setIsPendig(false);
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
          Edit Item
        </FieldLegend>
        <FieldDescription className="md:text-base">
          Modify item details.
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
                      className="ml-0.5 inline-flex items-center justify-center rounded-full p-1 text-primary/60 transition hover:bg-red-500/10 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
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

                    {existImageUrls && existImageUrls.length > 0 ? (
                      <ExistingItemImagesPreview form={form} />
                    ) : uploadedImages && uploadedImages.length > 0 ? (
                      <UploadedImagesPreview form={form} />
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

      <div>
        {message && !message.success && <FieldError errors={[message]} />}
        {message && message.success && (
          <p className="text-green-500 text-xs font-normal">
            {message.message}
          </p>
        )}
      </div>

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
