import * as z from "zod/v4";
import { db } from "@/lib/db";
import { buildProjectState, errorResponse, HttpError, loadOwnedProject } from "@/lib/project";

const Body = z.object({
  description: z.string().max(1000).optional(),
  imagePrompt: z.string().max(3500).optional(),
  motionPrompt: z.string().max(2000).optional(),
  dialogue: z.string().max(600).nullable().optional(),
  duration: z.number().int().min(3).max(15).optional(),
});

/** Edit a shot's prompts before (re)generating. */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string; shotId: string }> }) {
  try {
    const { id, shotId } = await ctx.params;
    const { project } = await loadOwnedProject(id, { requireUser: true });
    const shot = await db.shot.findUnique({ where: { id: shotId }, include: { episode: true } });
    if (!shot || shot.episode.projectId !== project.id) throw new HttpError(404, "Shot not found");
    const data = Body.parse(await req.json());
    await db.shot.update({ where: { id: shotId }, data });
    const fresh = await db.project.findUniqueOrThrow({ where: { id: project.id } });
    return Response.json(await buildProjectState(fresh));
  } catch (e) {
    if (e instanceof z.ZodError) return Response.json({ error: "Invalid shot data" }, { status: 400 });
    return errorResponse(e);
  }
}
