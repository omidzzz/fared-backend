import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

export const s3Client = new S3Client({
  endpoint: env.STORAGE_ENDPOINT,
  region: env.STORAGE_REGION,
  credentials: {
    accessKeyId: env.STORAGE_ACCESS_KEY || "",
    secretAccessKey: env.STORAGE_SECRET_KEY || "",
  },
  forcePathStyle: true, // Required for Liara compatibility
});

export const BUCKET_NAME = env.STORAGE_BUCKET;

/**
 * Upload a file buffer to Object Storage.
 * Returns the public URL.
 */
export async function uploadToStorage(
  key: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  console.log("[storage] uploadToStorage starting", {
    key,
    bufferSize: buffer?.length,
    mimeType,
    endpoint: env.STORAGE_ENDPOINT,
    bucket: env.STORAGE_BUCKET,
    region: env.STORAGE_REGION,
    hasAccessKey: !!env.STORAGE_ACCESS_KEY,
    hasSecretKey: !!env.STORAGE_SECRET_KEY,
  });

  try {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    const url = `${env.STORAGE_ENDPOINT}/${BUCKET_NAME}/${key}`;
    console.log("[storage] uploadToStorage success", { url });
    // Liara Object Storage URL format
    return url;
  } catch (err) {
    console.error("[storage] uploadToStorage error:", err);
    throw err;
  }
}

/**
 * Delete a file from Object Storage.
 */
export async function deleteFromStorage(key: string): Promise<void> {
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}
