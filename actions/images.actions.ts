"use server";

import { s3 } from "@/app/api/upload/route";
import { ActionResult, fail, ok } from "@/lib/actionsType";
import { deleteObjects, presignGetObject } from "@better-upload/server/helpers";
import { cacheTag } from "next/cache";

export async function generateItemImageUrls({
  imageKeys,
}: {
  imageKeys: string[];
}): Promise<ActionResult<string[]>> {
  "use cache";
  cacheTag("item_images");

  if (!imageKeys || imageKeys.length === 0) {
    return fail("Images not found");
  }

  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    return fail("Images not found");
  }

  const urls = await Promise.all(
    imageKeys.map((imageKey) =>
      presignGetObject(s3, {
        bucket: bucketName,
        key: imageKey,
        expiresIn: 3600,
      })
    )
  );

  return ok(urls);
}

export async function deleteImages(images: string[]) {
  const keys = images.map((value) => ({ key: value }));
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    return fail("Server misconfiguration: S3 bucket is missing");
  }
  await deleteObjects(s3, {
    bucket: bucketName,
    objects: keys,
  });
}
