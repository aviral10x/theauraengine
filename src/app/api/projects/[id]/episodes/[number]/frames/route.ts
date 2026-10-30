import * as z from "zod/v4";
import { db } from "@/lib/db";
import { startFrames } from "@/lib/generation";
import { buildProjectState, errorResponse, HttpError, loadOwnedProject } from "@/lib/project";

export const maxDuration = 120;

const Body = z.object({ shotIds: z.array(z.string()).max(20).optional() });

export async function POST(req: Request, ctx: { params: Promise<{ id: string; number: string }> }) {
  try {
    const { id, number } = await ctx.params;
    const { project, user } = await loadOwnedProject(id, { requireUser: true });
    const { shotIds } = Body.parse(await req.json().catch(() => ({})));
    const episode = await db.episode.findUnique({
      where: { projectId_number: { projectId: project.id, number: Number(number) } },
      include: { shots: { orderBy: { index: "asc" } } },
    });
    if (!episode) throw new HttpError(404, "Episode not found");
    const shots = episode.shots.filter((s) => (shotIds ? shotIds.includes(s.id) : s.frameStatus !== "done") && s.frameStatus !== "pending");
    if (shots.length === 0) throw new HttpError(400, "No shots to generate");
    const charsPending = await db.generation.count({ where: { projectId: project.id, kind: "character", status: { in: ["queued", "in_progress"] } } });
    if (charsPending) throw new HttpError(409, "Character sheets are still rendering. Frames use them as references, so give them a few seconds.");
    await startFrames(project, user!.id, shots);
    const fresh = await db.project.findUniqueOrThrow({ where: { id: project.id } });
    return Response.json(await buildProjectState(fresh));
  } catch (e) {
    return errorResponse(e);
  }
}
