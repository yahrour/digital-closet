"use server";

import { s3 } from "@/app/api/upload/route";
import { deleteObjects } from "@better-upload/server/helpers";

export async function deleteImages(images: string[]) {
  const keys = images.map((value) => ({ key: value }));
  await deleteObjects(s3, {
    bucket: process.env.S3_BUCKET_NAME || "",
    objects: keys,
  });
}
