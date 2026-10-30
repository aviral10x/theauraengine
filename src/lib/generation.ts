import "server-only";
import type { Generation, Project, Shot } from "@prisma/client";
import { db, parseJson } from "./db";
import { features, env } from "./env";
import { chargeCredits, grantCredits, COSTS } from "./credits";
import { hfStatus, hfSubmit, outputUrlFrom, VIDEO_MODELS, type HfStatus } from "./higgsfield";
import { archiveRemote, putObject } from "./storage";
import type { BrandScan, SeriesBible } from "./schemas";

const TERMINAL = new Set(["completed", "failed", "nsfw", "canceled", "demo"]);

function placeholder(kind: string, label: string, aspect: string) {
  const q = new URLSearchParams({ kind, label: label.slice(0, 90), aspect });
  return `/api/placeholder?${q.toString()}`;
}

type StartArgs = {
  project: Project;
  userId: string;
  kind: "character" | "frame" | "video";
  targetId: string;
  model: string;
  input: Record<string, unknown>;
  credits: number;
  demoLabel: string;
};

/** Charge, submit to Higgsfield and record the generation. In demo mode, completes instantly with a placeholder. */
async function startGeneration(a: StartArgs): Promise<Generation> {
  if (!features.higgsfield) {
    const gen = await db.generation.create({
      data: {
        projectId: a.project.id,
        userId: a.userId,
        kind: a.kind,
        targetId: a.targetId,
        model: `demo:${a.model}`,
        status: "demo",
        input: JSON.stringify(a.input),
        outputUrl: a.kind === "video" ? null : placeholder(a.kind, a.demoLabel, a.kind === "character" ? "1:1" : a.project.aspect),
      },
    });
    await applyToTarget(gen, "demo", gen.outputUrl, null, null);
    return gen;
  }

  const gen = await db.generation.create({
    data: {
      projectId: a.project.id,
      userId: a.userId,
      kind: a.kind,
      targetId: a.targetId,
      model: a.model,
      input: JSON.stringify(a.input),
      credits: a.credits,
    },
  });
  try {
    await chargeCredits(a.userId, a.credits, `${a.kind}:${a.model}`, `gen:${gen.id}`);
  } catch (e) {
    await db.generation.delete({ where: { id: gen.id } });
    throw e;
  }
  await markTarget(gen, "pending", null);
  try {
    const sub = await hfSubmit(a.model, a.input, gen.id);
    return await db.generation.update({
      where: { id: gen.id },
      data: { requestId: sub.request_id, statusUrl: sub.status_url, status: sub.status || "queued" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Submit failed";
    await finalize(gen, "failed", null, msg);
    return { ...gen, status: "failed", error: msg };
  }
}

async function markTarget(gen: Generation, status: string, error: string | null) {
  if (gen.kind === "frame") await db.shot.updateMany({ where: { id: gen.targetId }, data: { frameStatus: status, error } });
  if (gen.kind === "video") await db.shot.updateMany({ where: { id: gen.targetId }, data: { videoStatus: status, error } });
}

/** Write the result of a generation onto the shot (characters are derived from generations on read). */
async function applyToTarget(gen: Generation, status: string, displayUrl: string | null, inputUrl: string | null, error: string | null) {
  const ok = status === "completed" || status === "demo";
  if (ok && (gen.kind === "frame" || gen.kind === "video")) {
    // Any new frame/clip invalidates the stitched episode.
    await db.episode.updateMany({ where: { shots: { some: { id: gen.targetId } } }, data: { finalUrl: null, stitchedAt: null } });
  }
  if (gen.kind === "frame") {
    await db.shot.updateMany({
      where: { id: gen.targetId },
      data: ok
        ? { frameStatus: status === "demo" ? "demo" : "done", frameUrl: displayUrl, frameInput: inputUrl, error: null, videoStatus: "none", videoUrl: null }
        : { frameStatus: "failed", error },
    });
  } else if (gen.kind === "video") {
    await db.shot.updateMany({
      where: { id: gen.targetId },
      data: ok
        ? { videoStatus: status === "demo" ? "demo" : "done", videoUrl: displayUrl, error: status === "demo" ? "Demo mode: add Higgsfield API keys to render video." : null }
        : { videoStatus: "failed", error },
    });
  }
}

/** Idempotently move a generation to a terminal state: archive output, update target, refund on failure. */
async function finalize(gen: Generation, status: HfStatus | "failed", remoteUrl: string | null, error: string | null) {
  const claimed = await db.generation.updateMany({
    where: { id: gen.id, status: { notIn: Array.from(TERMINAL) } },
    data: { status, error, outputUrl: remoteUrl },
  });
  if (claimed.count === 0) return; // already finalized (webhook + poll race)

  if (status === "completed" && remoteUrl) {
    const archived = await archiveRemote(remoteUrl, `projects/${gen.projectId}/${gen.kind}/${gen.id}`);
    const display = archived?.url ?? remoteUrl;
    const input = archived?.isPublic ? archived.url : remoteUrl;
    await db.generation.update({ where: { id: gen.id }, data: { archivedUrl: archived?.url ?? null } });
    await applyToTarget(gen, "completed", display, input, null);
    return;
  }

  const reason = status === "nsfw" ? "Blocked by content moderation. Try rewording the prompt." : error || "Generation failed";
  await applyToTarget(gen, "failed", null, null, reason);
  if (gen.userId && gen.credits > 0 && !gen.refunded) {
    const granted = await grantCredits(gen.userId, gen.credits, `refund:${gen.kind}`, `refund:${gen.id}`);
    if (granted) await db.generation.update({ where: { id: gen.id }, data: { refunded: true } });
  }
}

/** Handle a Higgsfield webhook payload. */
export async function handleWebhook(payload: {
  request_id: string;
  status: HfStatus;
  error?: string | null;
  payload?: { images?: { url: string }[]; video?: { url: string } } | null;
}) {
  const gen = await db.generation.findUnique({ where: { requestId: payload.request_id } });
  if (!gen) return;
  if (!["completed", "failed", "nsfw", "canceled"].includes(payload.status)) return;
  await finalize(gen, payload.status, payload.payload ? outputUrlFrom(payload.payload) : null, payload.error ?? null);
}

/** Poll in-flight generations for a project (fallback when webhooks aren't reachable, e.g. localhost). */
export async function refreshPending(projectId: string) {
  if (!features.higgsfield) return;
  const stale = new Date(Date.now() - 4000);
  const pending = await db.generation.findMany({
    where: { projectId, status: { in: ["queued", "in_progress"] }, requestId: { not: null }, updatedAt: { lt: stale } },
    take: 12,
    orderBy: { updatedAt: "asc" },
  });
  await Promise.all(
    pending.map(async (gen) => {
      try {
        const st = await hfStatus(gen.requestId!, gen.statusUrl);
        if (["completed", "failed", "nsfw", "canceled"].includes(st.status)) {
          await finalize(gen, st.status, outputUrlFrom(st), st.error ?? null);
        } else {
          await db.generation.update({ where: { id: gen.id }, data: { status: st.status } });
        }
      } catch (e) {
        // Give up on requests that have been pending for over an hour.
        if (Date.now() - gen.createdAt.getTime() > 60 * 60 * 1000) {
          await finalize(gen, "failed", null, e instanceof Error ? e.message : "Timed out");
        } else {
          await db.generation.update({ where: { id: gen.id }, data: { updatedAt: new Date() } });
        }
      }
    }),
  );
}

// ---------------------------------------------------------------------------
// Production steps
// ---------------------------------------------------------------------------

export async function characterRefs(projectId: string) {
  const gens = await db.generation.findMany({
    where: { projectId, kind: "character" },
    orderBy: { createdAt: "desc" },
  });
  const map = new Map<string, Generation>();
  for (const g of gens) if (!map.has(g.targetId)) map.set(g.targetId, g);
  return map;
}

export function genDisplayUrl(g: Generation | undefined) {
  return g ? g.archivedUrl ?? g.outputUrl : null;
}
export function genInputUrl(g: Generation | undefined) {
  if (!g || (g.status !== "completed")) return null;
  return g.archivedUrl && (features.s3 || features.blob) ? g.archivedUrl : g.outputUrl;
}

export async function startCharacterSheets(project: Project, userId: string, keys?: string[]) {
  const series = parseJson<SeriesBible | null>(project.series, null);
  if (!series) throw new Error("Write the series first");
  const chars = series.characters.filter((c) => !keys || keys.includes(c.key));
  return Promise.all(
    chars.map((c) =>
      startGeneration({
        project,
        userId,
        kind: "character",
        targetId: c.key,
        model: env.hfImageModel,
        credits: COSTS.characterSheet,
        demoLabel: c.name,
        input: {
          prompt: `Character reference sheet of ${c.name}, ${c.role}. ${c.visualDescription}. Full-body front view on the left and a close-up portrait on the right, neutral light-grey studio background, consistent design, clean readable silhouette. ${series.visualStyle}`,
          aspect_ratio: "16:9",
          resolution: "1k",
          quality: "medium",
        },
      }),
    ),
  );
}

export async function startFrames(project: Project, userId: string, shots: Shot[]) {
  const series = parseJson<SeriesBible | null>(project.series, null);
  const scan = parseJson<BrandScan | null>(project.dna, null);
  if (!series || !scan) throw new Error("Series missing");
  const refs = await characterRefs(project.id);
  const product = scan.brand.products.find((p) => p.imageUrl);
  return Promise.all(
    shots.map((shot) => {
      const keys = parseJson<string[]>(shot.characters, []);
      const imageUrls = keys.map((k) => genInputUrl(refs.get(k))).filter((u): u is string => Boolean(u));
      const mentionsProduct = product && new RegExp(`product|${escapeRe(product.name.split(" ")[0])}`, "i").test(shot.imagePrompt);
      if (mentionsProduct && product?.imageUrl) imageUrls.push(product.imageUrl);
      const consistency = imageUrls.length
        ? " Keep every character's face, proportions, outfit and colors exactly as in the reference images; match the product exactly."
        : "";
      return startGeneration({
        project,
        userId,
        kind: "frame",
        targetId: shot.id,
        model: env.hfImageModel,
        credits: COSTS.frame,
        demoLabel: shot.description,
        input: {
          prompt: `${shot.imagePrompt}${consistency}`.slice(0, 3800),
          ...(imageUrls.length ? { image_urls: imageUrls.slice(0, 10) } : {}),
          aspect_ratio: project.aspect,
          resolution: "1k",
          quality: "medium",
        },
      });
    }),
  );
}

export async function startVideos(project: Project, userId: string, shots: Shot[], quality: "turbo" | "std" | "pro") {
  const model = VIDEO_MODELS[quality] ?? VIDEO_MODELS.std;
  const perSec = COSTS.videoPerSecond[quality] ?? COSTS.videoPerSecond.std;
  const ready = shots.filter((s) => s.frameInput || !features.higgsfield);
  return Promise.all(
    ready.map((shot) => {
      const duration = Math.max(3, Math.min(15, shot.duration));
      const speech = shot.dialogue ? ` Dialogue: ${shot.dialogue}` : "";
      return startGeneration({
        project,
        userId,
        kind: "video",
        targetId: shot.id,
        model,
        credits: perSec * duration,
        demoLabel: shot.description,
        input: {
          prompt: `${shot.motionPrompt}.${speech}`.slice(0, 2400),
          image_url: shot.frameInput,
          duration,
          sound: "on",
        },
      });
    }),
  );
}

export async function storeUpload(projectId: string, name: string, body: Buffer, type: string) {
  return putObject(`projects/${projectId}/final/${name}`, body, type);
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
