import { readFile, stat } from "fs/promises";
import path from "path";
import { LOCAL_MEDIA_DIR } from "@/lib/storage";

const TYPES: Record<string, string> = { mp4: "video/mp4", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };

/** Serves locally stored media (used when no S3/R2 bucket is configured). */
export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const file = path.resolve(LOCAL_MEDIA_DIR, ...parts);
  if (!file.startsWith(LOCAL_MEDIA_DIR + path.sep)) return new Response("Not found", { status: 404 });
  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) return new Response("Not found", { status: 404 });
  const type = TYPES[path.extname(file).slice(1).toLowerCase()] ?? "application/octet-stream";
  const buf = await readFile(file);

  // Basic range support so <video> can seek.
  const range = req.headers.get("range");
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const start = m?.[1] ? Number(m[1]) : 0;
    const end = m?.[2] ? Math.min(Number(m[2]), buf.length - 1) : buf.length - 1;
    return new Response(buf.subarray(start, end + 1), {
      status: 206,
      headers: { "content-type": type, "content-range": `bytes ${start}-${end}/${buf.length}`, "accept-ranges": "bytes", "content-length": String(end - start + 1) },
    });
  }
  return new Response(buf, { headers: { "content-type": type, "accept-ranges": "bytes", "cache-control": "public, max-age=31536000, immutable" } });
}
