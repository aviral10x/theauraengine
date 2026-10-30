import * as z from "zod/v4";
import { db, parseJson } from "@/lib/db";
import { writeSeries } from "@/lib/claude";
import { chargeCredits, grantCredits, COSTS } from "@/lib/credits";
import { getFormat } from "@/lib/formats";
import { features } from "@/lib/env";
import { buildProjectState, errorResponse, HttpError, loadOwnedProject } from "@/lib/project";
import type { CrawlResult } from "@/lib/crawl";
import type { BrandScan } from "@/lib/schemas";

export const maxDuration = 300;

const Body = z.object({
  conceptIdx: z.number().int().min(0).max(2),
  formatId: z.string().max(40),
  episodes: z.number().int().min(1).max(12),
  direction: z.string().max(1500).optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { project, user } = await loadOwnedProject(id, { requireUser: true });
    const body = Body.parse(await req.json());
    const scan = parseJson<BrandScan | null>(project.dna, null);
    const crawl = parseJson<CrawlResult | null>(project.crawl, null);
    if (!scan || !crawl || !scan.concepts[body.conceptIdx]) throw new HttpError(400, "Concept not found");
    const format = getFormat(body.formatId);

    const cost = features.claude ? COSTS.series : 0;
    const ref = `series:${project.id}:${Date.now()}`;
    await chargeCredits(user!.id, cost, "series", ref);
    let series;
    try {
      series = await writeSeries({ crawl, scan, conceptIdx: body.conceptIdx, formatId: format.id, episodes: body.episodes, direction: body.direction });
    } catch (e) {
      await grantCredits(user!.id, cost, "refund:series", `refund:${ref}`);
      throw e;
    }

    // Replace any previous season (episodes, shots and their generations).
    await db.$transaction([
      db.episode.deleteMany({ where: { projectId: project.id } }),
      db.generation.deleteMany({ where: { projectId: project.id, status: { notIn: ["queued", "in_progress"] } } }),
      db.project.update({
        where: { id: project.id },
        data: { series: JSON.stringify(series), conceptIdx: body.conceptIdx, formatId: format.id, aspect: format.aspect, status: "series" },
      }),
      ...series.episodes.map((e) =>
        db.episode.create({ data: { projectId: project.id, number: e.number, title: e.title, outline: JSON.stringify(e) } }),
      ),
    ]);
    const fresh = await db.project.findUniqueOrThrow({ where: { id: project.id } });
    return Response.json(await buildProjectState(fresh));
  } catch (e) {
    if (e instanceof z.ZodError) return Response.json({ error: "Invalid request" }, { status: 400 });
    return errorResponse(e);
  }
}
