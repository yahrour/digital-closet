"use server";

import { s3 } from "@/app/api/upload/route";
import { presignGetObject } from "@better-upload/server/helpers";
import { cacheTag } from "next/cache";

export async function generateItemImageUrls({
  image_keys,
}: {
  image_keys: string[];
}) {
  "use cache";
  cacheTag("item_images");

  if (!image_keys || image_keys.length === 0) {
    return null;
  }

  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    return null;
  }

  const urls = await Promise.all(
    image_keys.map((image_key) =>
      presignGetObject(s3, {
        bucket: bucketName,
        key: image_key,
        expiresIn: 3600,
      }),
    ),
  );

  return urls;
}
