"use server";

import { s3 } from "@/app/api/upload/route";
import { ActionResult, fail, ok } from "@/lib/actionsType";
import { deleteObjects, presignGetObject } from "@better-upload/server/helpers";
import { cacheTag } from "next/cache";

export async function generateItemImageUrls({
  image_keys,
}: {
  image_keys: string[];
}): Promise<ActionResult<string[]>> {
  "use cache";
  cacheTag("item_images");

  if (!image_keys || image_keys.length === 0) {
    return fail("IMAGE_KEYS", "Images not found");
  }

  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    return fail("BUCKET", "Images not found");
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

  return ok(urls);
}

type resp = {
  deleted: {
    deleteMarker: boolean | undefined;
    deleteMarkerVersionId: string | undefined;
    key: string;
    versionId: string | undefined;
  }[];
  errors: {
    code: string;
    message: string;
    key: string;
    versionId: string | undefined;
  }[];
};

export async function deleteImages(images: string[]): Promise<resp> {
  const keys = images.map((value) => ({ key: value }));
  const result = await deleteObjects(s3, {
    bucket: process.env.S3_BUCKET_NAME || "",
    objects: keys,
  });
  return result;
}
