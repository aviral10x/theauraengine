import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { env, features } from "./env";

export const LOCAL_MEDIA_DIR = path.join(process.cwd(), ".data", "media");

let s3: S3Client | null = null;
function s3Client() {
  if (!s3) {
    s3 = new S3Client({
      region: env.s3Region,
      endpoint: env.s3Endpoint || undefined,
      credentials: { accessKeyId: env.s3AccessKey, secretAccessKey: env.s3SecretKey },
      forcePathStyle: Boolean(env.s3Endpoint),
    });
  }
  return s3;
}

/**
 * Store bytes and return a URL.
 * - With S3/R2 configured: returns a public URL (also usable as a model input).
 * - Without: writes to .data/media and serves it via /api/media (dev / single-server only).
 */
export async function putObject(key: string, body: Buffer, contentType: string): Promise<{ url: string; isPublic: boolean }> {
  const safeKey = key.replace(/[^a-zA-Z0-9/_.-]/g, "_").replace(/\.\.+/g, ".");
  if (features.s3) {
    await s3Client().send(
      new PutObjectCommand({ Bucket: env.s3Bucket, Key: safeKey, Body: body, ContentType: contentType }),
    );
    return { url: `${env.s3PublicUrl}/${safeKey}`, isPublic: true };
  }
  const file = path.join(LOCAL_MEDIA_DIR, safeKey);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
  return { url: `/api/media/${safeKey}`, isPublic: false };
}

/** Copy a remote (expiring) Higgsfield output into our storage. Returns null on failure so callers can fall back. */
export async function archiveRemote(remoteUrl: string, keyPrefix: string): Promise<{ url: string; isPublic: boolean } | null> {
  try {
    const res = await fetch(remoteUrl);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "application/octet-stream";
    const ext = type.includes("mp4") ? "mp4" : type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("jpeg") || type.includes("jpg") ? "jpg" : "bin";
    const buf = Buffer.from(await res.arrayBuffer());
    return await putObject(`${keyPrefix}.${ext}`, buf, type);
  } catch {
    return null;
  }
}
