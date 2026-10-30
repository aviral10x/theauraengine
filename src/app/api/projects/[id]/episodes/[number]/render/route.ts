import * as z from "zod/v4";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import { startVideos } from "@/lib/generation";
import { buildProjectState, errorResponse, HttpError, loadOwnedProject } from "@/lib/project";

export const maxDuration = 120;

const Body = z.object({
  shotIds: z.array(z.string()).max(20).optional(),
  quality: z.enum(["turbo", "std", "pro"]).default("std"),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string; number: string }> }) {
  try {
    const { id, number } = await ctx.params;
    const { project, user } = await loadOwnedProject(id, { requireUser: true });
    const { shotIds, quality } = Body.parse(await req.json().catch(() => ({})));
    const episode = await db.episode.findUnique({
      where: { projectId_number: { projectId: project.id, number: Number(number) } },
      include: { shots: { orderBy: { index: "asc" } } },
    });
    if (!episode) throw new HttpError(404, "Episode not found");
    const shots = episode.shots.filter(
      (s) => (shotIds ? shotIds.includes(s.id) : s.videoStatus !== "done") && s.videoStatus !== "pending",
    );
    if (features.higgsfield && shots.some((s) => !s.frameInput)) {
      throw new HttpError(400, "Approve storyboard frames for these shots first. Video is generated from each frame.");
    }
    if (shots.length === 0) throw new HttpError(400, "No shots to render");
    await startVideos(project, user!.id, shots, quality);
    await db.episode.update({ where: { id: episode.id }, data: { finalUrl: null, stitchedAt: null } });
    const fresh = await db.project.findUniqueOrThrow({ where: { id: project.id } });
    return Response.json(await buildProjectState(fresh));
  } catch (e) {
    return errorResponse(e);
  }
}
