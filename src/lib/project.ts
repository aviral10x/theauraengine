import "server-only";
import type { Project } from "@prisma/client";
import { db, parseJson } from "./db";
import { getAnonId, getUser, type SessionUser } from "./auth";
import { characterRefs, genDisplayUrl, refreshPending } from "./generation";
import { features } from "./env";
import { InsufficientCreditsError } from "./credits";
import type { CrawlResult } from "./crawl";
import type { BrandScan, EpisodeScript, SeriesBible } from "./schemas";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Load a project the current user owns (or the anonymous visitor created). */
export async function loadOwnedProject(id: string, opts: { requireUser?: boolean } = {}): Promise<{ project: Project; user: SessionUser | null }> {
  const [user, anonId, project] = await Promise.all([getUser(), getAnonId(), db.project.findUnique({ where: { id } })]);
  if (!project) throw new HttpError(404, "Project not found");
  const owns = (user && project.userId === user.id) || (!project.userId && anonId && project.anonId === anonId);
  if (!owns) throw new HttpError(404, "Project not found");
  if (opts.requireUser && !user) throw new HttpError(401, "Sign in to continue");
  if (opts.requireUser && user && !project.userId) {
    await db.project.update({ where: { id }, data: { userId: user.id } });
    project.userId = user.id;
  }
  return { project, user };
}

export type ShotState = {
  id: string;
  index: number;
  duration: number;
  shotType: string;
  description: string;
  imagePrompt: string;
  motionPrompt: string;
  dialogue: string | null;
  onScreenText: string | null;
  characters: string[];
  frameUrl: string | null;
  frameStatus: string;
  videoUrl: string | null;
  videoStatus: string;
  error: string | null;
};

export type EpisodeState = {
  id: string;
  number: number;
  title: string;
  outline: SeriesBible["episodes"][number];
  script: Pick<EpisodeScript, "caption" | "hashtags"> | null;
  finalUrl: string | null;
  shots: ShotState[];
};

export type ProjectState = {
  id: string;
  url: string;
  domain: string;
  name: string;
  status: string;
  formatId: string | null;
  conceptIdx: number | null;
  aspect: string;
  scan: BrandScan;
  site: Pick<CrawlResult, "title" | "description" | "ogImage" | "logo" | "images" | "socials">;
  series: SeriesBible | null;
  characters: (SeriesBible["characters"][number] & { imageUrl: string | null; status: string; error: string | null })[];
  episodes: EpisodeState[];
  pending: number;
  owned: boolean;
  features: { claude: boolean; higgsfield: boolean; stripe: boolean };
};

export async function buildProjectState(project: Project, opts: { refresh?: boolean; owned?: boolean } = {}): Promise<ProjectState> {
  if (opts.refresh) await refreshPending(project.id);
  const [episodes, refs, pending] = await Promise.all([
    db.episode.findMany({ where: { projectId: project.id }, orderBy: { number: "asc" }, include: { shots: { orderBy: { index: "asc" } } } }),
    characterRefs(project.id),
    db.generation.count({ where: { projectId: project.id, status: { in: ["queued", "in_progress"] } } }),
  ]);
  const crawl = parseJson<CrawlResult>(project.crawl, {} as CrawlResult);
  const scan = parseJson<BrandScan>(project.dna, {} as BrandScan);
  const series = parseJson<SeriesBible | null>(project.series, null);

  return {
    id: project.id,
    url: project.url,
    domain: project.domain,
    name: project.name ?? scan.brand?.name ?? project.domain,
    status: project.status,
    formatId: project.formatId,
    conceptIdx: project.conceptIdx,
    aspect: project.aspect,
    scan,
    site: {
      title: crawl.title,
      description: crawl.description,
      ogImage: crawl.ogImage,
      logo: crawl.logo,
      images: (crawl.images ?? []).slice(0, 12),
      socials: crawl.socials ?? [],
    },
    series,
    characters: (series?.characters ?? []).map((c) => {
      const g = refs.get(c.key);
      const status = !g ? "none" : g.status === "completed" ? "done" : g.status === "demo" ? "demo" : ["failed", "nsfw", "canceled"].includes(g.status) ? "failed" : "pending";
      return { ...c, imageUrl: status === "done" || status === "demo" ? genDisplayUrl(g) : null, status, error: g?.error ?? null };
    }),
    episodes: episodes.map((e) => ({
      id: e.id,
      number: e.number,
      title: e.title,
      outline: parseJson(e.outline, { number: e.number, title: e.title, hook: "", synopsis: "", cliffhanger: "" }),
      script: e.script ? (({ caption, hashtags }) => ({ caption, hashtags }))(parseJson<EpisodeScript>(e.script, { caption: "", hashtags: [], shots: [] })) : null,
      finalUrl: e.finalUrl,
      shots: e.shots.map((s) => ({
        id: s.id,
        index: s.index,
        duration: s.duration,
        shotType: s.shotType,
        description: s.description,
        imagePrompt: s.imagePrompt,
        motionPrompt: s.motionPrompt,
        dialogue: s.dialogue,
        onScreenText: s.onScreenText,
        characters: parseJson<string[]>(s.characters, []),
        frameUrl: s.frameUrl,
        frameStatus: s.frameStatus,
        videoUrl: s.videoUrl,
        videoStatus: s.videoStatus,
        error: s.error,
      })),
    })),
    pending,
    owned: opts.owned ?? true,
    features: { claude: features.claude, higgsfield: features.higgsfield, stripe: features.stripe },
  };
}

export function errorResponse(e: unknown) {
  if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
  if (e instanceof InsufficientCreditsError) {
    return Response.json({ error: e.message, code: "insufficient_credits" }, { status: 402 });
  }
  console.error(e);
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Aura Engine is finishing setup (database not connected yet). Please try again shortly." }, { status: 503 });
  }
  // Never leak internal error details (SQL, stack traces, provider responses) to clients.
  return Response.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
}
