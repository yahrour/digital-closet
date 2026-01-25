"use client";

import { useUploadFiles } from "@better-upload/client";
import { UploadDropzone } from "@/components/ui/upload-dropzone";

export function ImageUpload() {
  const { control } = useUploadFiles({
    route: "images",
  });
  return (
    <UploadDropzone
      control={control}
      accept="image/*"
      description={{
        maxFiles: 2,
        maxFileSize: "5MB",
        fileTypes: "JPEG, PNG",
      }}
    />
  );
}
