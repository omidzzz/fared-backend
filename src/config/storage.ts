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
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  // Liara Object Storage URL format
  return `${env.STORAGE_ENDPOINT}/${BUCKET_NAME}/${key}`;
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
