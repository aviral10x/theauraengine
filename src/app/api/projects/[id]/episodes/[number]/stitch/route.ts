import { readFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { stitchClips } from "@/lib/stitch";
import { storeUpload } from "@/lib/generation";
import { LOCAL_MEDIA_DIR } from "@/lib/storage";
import { buildProjectState, errorResponse, HttpError, loadOwnedProject } from "@/lib/project";

export const maxDuration = 300;

async function resolveLocal(url: string): Promise<Buffer | null> {
  if (!url.startsWith("/api/media/")) return null;
  const rel = decodeURIComponent(url.slice("/api/media/".length));
  const file = path.resolve(LOCAL_MEDIA_DIR, rel);
  if (!file.startsWith(LOCAL_MEDIA_DIR + path.sep)) return null;
  return readFile(file).catch(() => null);
}

export async function POST(_req: Request, ctx: { params: Promise<{ id: string; number: string }> }) {
  try {
    const { id, number } = await ctx.params;
    const { project } = await loadOwnedProject(id, { requireUser: true });
    const episode = await db.episode.findUnique({
      where: { projectId_number: { projectId: project.id, number: Number(number) } },
      include: { shots: { orderBy: { index: "asc" } } },
    });
    if (!episode) throw new HttpError(404, "Episode not found");
    const clips = episode.shots.map((s) => s.videoUrl);
    if (clips.length === 0 || clips.some((c) => !c)) throw new HttpError(400, "Render every shot before stitching the episode.");

    const buf = await stitchClips(clips as string[], project.aspect, resolveLocal);
    const stored = await storeUpload(project.id, `episode-${episode.number}-${Date.now()}.mp4`, buf, "video/mp4");
    await db.episode.update({ where: { id: episode.id }, data: { finalUrl: stored.url, stitchedAt: new Date() } });
    const fresh = await db.project.findUniqueOrThrow({ where: { id: project.id } });
    return Response.json(await buildProjectState(fresh));
  } catch (e) {
    return errorResponse(e);
  }
}
