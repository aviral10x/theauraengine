import { db, parseJson } from "@/lib/db";
import { writeEpisode } from "@/lib/claude";
import { chargeCredits, grantCredits, COSTS } from "@/lib/credits";
import { features } from "@/lib/env";
import { buildProjectState, errorResponse, HttpError, loadOwnedProject } from "@/lib/project";
import type { BrandScan, SeriesBible } from "@/lib/schemas";

export const maxDuration = 300;

export async function POST(_req: Request, ctx: { params: Promise<{ id: string; number: string }> }) {
  try {
    const { id, number } = await ctx.params;
    const { project, user } = await loadOwnedProject(id, { requireUser: true });
    const scan = parseJson<BrandScan | null>(project.dna, null);
    const series = parseJson<SeriesBible | null>(project.series, null);
    const episode = await db.episode.findUnique({ where: { projectId_number: { projectId: project.id, number: Number(number) } } });
    if (!scan || !series || !episode) throw new HttpError(404, "Episode not found");

    const busy = await db.shot.count({ where: { episodeId: episode.id, OR: [{ frameStatus: "pending" }, { videoStatus: "pending" }] } });
    if (busy) throw new HttpError(409, "Wait for running generations to finish before rewriting this episode.");

    const cost = features.claude ? COSTS.episodeScript : 0;
    const ref = `script:${episode.id}:${Date.now()}`;
    await chargeCredits(user!.id, cost, "episode_script", ref);
    let script;
    try {
      script = await writeEpisode({ scan, series, formatId: project.formatId ?? "", episodeNumber: episode.number });
    } catch (e) {
      await grantCredits(user!.id, cost, "refund:episode_script", `refund:${ref}`);
      throw e;
    }

    await db.$transaction([
      db.shot.deleteMany({ where: { episodeId: episode.id } }),
      db.episode.update({ where: { id: episode.id }, data: { script: JSON.stringify(script), finalUrl: null, stitchedAt: null } }),
      ...script.shots.map((s, i) =>
        db.shot.create({
          data: {
            episodeId: episode.id,
            index: i,
            duration: s.duration,
            shotType: s.shotType,
            description: s.description,
            imagePrompt: s.imagePrompt,
            motionPrompt: s.motionPrompt,
            dialogue: s.dialogue,
            onScreenText: s.onScreenText,
            characters: JSON.stringify(s.characters ?? []),
          },
        }),
      ),
      db.project.update({ where: { id: project.id }, data: { status: "production" } }),
    ]);
    const fresh = await db.project.findUniqueOrThrow({ where: { id: project.id } });
    return Response.json(await buildProjectState(fresh));
  } catch (e) {
    return errorResponse(e);
  }
}
