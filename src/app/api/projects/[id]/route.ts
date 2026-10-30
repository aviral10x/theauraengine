import { db } from "@/lib/db";
import { buildProjectState, errorResponse, loadOwnedProject } from "@/lib/project";

export const maxDuration = 120;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { project } = await loadOwnedProject(id);
    return Response.json(await buildProjectState(project, { refresh: true }));
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await loadOwnedProject(id, { requireUser: true });
    await db.project.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
