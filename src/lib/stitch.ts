import "server-only";
import { spawn } from "child_process";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { existsSync } from "fs";
import os from "os";
import path from "path";

function ffmpegPath(): string {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const p = require("ffmpeg-static") as string | null;
    if (p && existsSync(p)) return p;
  } catch {
    /* fall through */
  }
  return "ffmpeg";
}

function run(args: string[]): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn(/*turbopackIgnore: true*/ ffmpegPath(), args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", (e) => resolve({ code: -1, stderr: String(e) }));
    proc.on("close", (code) => resolve({ code: code ?? -1, stderr }));
  });
}

async function hasAudio(file: string) {
  const { stderr } = await run(["-hide_banner", "-i", file]);
  return /Stream #\d+:\d+.*Audio:/.test(stderr);
}

/** Download shot clips and concatenate them into one normalized MP4. */
export async function stitchClips(urls: string[], aspect: string, resolveLocal: (u: string) => Promise<Buffer | null>): Promise<Buffer> {
  const [w, h] = aspect === "16:9" ? [1280, 720] : [720, 1280];
  const dir = await mkdtemp(path.join(os.tmpdir(), "aura-stitch-"));
  try {
    const parts: string[] = [];
    for (let i = 0; i < urls.length; i++) {
      const src = path.join(dir, `src${i}.mp4`);
      const local = await resolveLocal(urls[i]);
      if (local) await writeFile(src, local);
      else {
        const res = await fetch(urls[i]);
        if (!res.ok) throw new Error(`Couldn't download clip ${i + 1}`);
        await writeFile(src, Buffer.from(await res.arrayBuffer()));
      }
      const out = path.join(dir, `part${i}.mp4`);
      const vf = `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p`;
      const args = (await hasAudio(src))
        ? ["-y", "-i", src, "-vf", vf, "-map", "0:v:0", "-map", "0:a:0"]
        : ["-y", "-i", src, "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-vf", vf, "-map", "0:v:0", "-map", "1:a:0", "-shortest"];
      const r = await run([...args, "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac", "-ar", "44100", "-ac", "2", out]);
      if (r.code !== 0) throw new Error(`ffmpeg failed on clip ${i + 1}: ${r.stderr.slice(-300)}`);
      parts.push(out);
    }
    const list = path.join(dir, "list.txt");
    await writeFile(list, parts.map((p) => `file '${p}'`).join("\n"));
    const final = path.join(dir, "final.mp4");
    const r = await run(["-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", final]);
    if (r.code !== 0) throw new Error(`ffmpeg concat failed: ${r.stderr.slice(-300)}`);
    return await readFile(final);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
