import * as z from "zod/v4";
import { db } from "@/lib/db";
import { startCharacterSheets } from "@/lib/generation";
import { buildProjectState, errorResponse, loadOwnedProject } from "@/lib/project";

export const maxDuration = 120;

const Body = z.object({ keys: z.array(z.string().max(40)).max(5).optional() });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { project, user } = await loadOwnedProject(id, { requireUser: true });
    const { keys } = Body.parse(await req.json().catch(() => ({})));
    await startCharacterSheets(project, user!.id, keys);
    const fresh = await db.project.findUniqueOrThrow({ where: { id: project.id } });
    return Response.json(await buildProjectState(fresh));
  } catch (e) {
    return errorResponse(e);
  }
}
