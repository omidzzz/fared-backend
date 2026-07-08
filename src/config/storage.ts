import path from "path";
import fs from "fs/promises";
import { env } from "./env";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

/**
 * Ensure the uploads directory exists.
 */
async function ensureUploadsDir(): Promise<void> {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch {
    // directory already exists
  }
}

/**
 * Upload a file buffer to local disk.
 * Returns the public URL accessible via the backend.
 */
export async function uploadToStorage(
  key: string,
  buffer: Buffer,
  _mimeType: string
): Promise<string> {
  console.log("[storage] uploadToStorage starting", {
    key,
    bufferSize: buffer?.length,
    uploadsDir: UPLOADS_DIR,
  });

  await ensureUploadsDir();

  const filePath = path.join(UPLOADS_DIR, key);
  const dir = path.dirname(filePath);

  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, buffer);

    // Build the public URL — accessible via backend's /uploads/ path
    const publicPath = key.replace(/\\/g, "/");
    const baseUrl = env.BACKEND_URL || `http://localhost:${env.PORT}`;
    const url = `${baseUrl}/uploads/${publicPath}`;

    console.log("[storage] uploadToStorage success", { url, filePath });
    return url;
  } catch (err) {
    console.error("[storage] uploadToStorage error:", err);
    throw err;
  }
}

/**
 * Delete a file from local disk.
 */
export async function deleteFromStorage(key: string): Promise<void> {
  const filePath = path.join(UPLOADS_DIR, key);
  console.log("[storage] deleteFromStorage", { key, filePath });

  try {
    await fs.unlink(filePath);
  } catch (err) {
    // File might already be deleted
    console.warn("[storage] deleteFromStorage warning:", err);
  }
}