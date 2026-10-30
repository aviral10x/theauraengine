"use client";

import { useState } from "react";
import type { EpisodeState, ShotState } from "@/lib/project";
import type { StudioCtx } from "./Studio";
import { SectionHeader } from "./Studio";

const QUALITY = [
  { id: "turbo", label: "Draft (Kling 3.0 Turbo)", perSec: 1 },
  { id: "std", label: "Standard (Kling 3.0)", perSec: 2 },
  { id: "pro", label: "Pro (Kling 3.0 Pro)", perSec: 4 },
] as const;

export function EpisodeView({ ctx, episode }: { ctx: StudioCtx; episode: EpisodeState }) {
  const { state, busy, run } = ctx;
  const [quality, setQuality] = useState<(typeof QUALITY)[number]["id"]>("std");
  const base = `/api/projects/${state.id}/episodes/${episode.number}`;
  const shots = episode.shots;
  const totalSec = shots.reduce((a, s) => a + s.duration, 0);
  const framesMissing = shots.filter((s) => s.frameStatus !== "done" && s.frameStatus !== "demo" && s.frameStatus !== "pending");
  const framesReady = shots.length > 0 && shots.every((s) => s.frameStatus === "done" || s.frameStatus === "demo");
  const videosMissing = shots.filter((s) => s.videoStatus !== "done" && s.videoStatus !== "pending");
  const allVideos = shots.length > 0 && shots.every((s) => s.videoStatus === "done");
  const perSec = QUALITY.find((q) => q.id === quality)!.perSec;
  const renderCost = videosMissing.reduce((a, s) => a + s.duration * perSec, 0);
  const charsReady = state.characters.length === 0 || state.characters.every((c) => c.status === "done" || c.status === "demo");
  const charsPending = state.characters.some((c) => c.status === "pending");

  if (shots.length === 0) {
    return (
      <div>
        <SectionHeader eyebrow={`Episode ${episode.number}`} title={episode.title} />
        <div className="card p-8 text-center">
          <p className="text-muted">{episode.outline.synopsis}</p>
          <button className="btn btn-primary mt-6" disabled={busy === `script-${episode.number}`} onClick={() => run(`script-${episode.number}`, `${base}/script`, {})}>
            {busy === `script-${episode.number}` ? "Writing…" : "Write shot list"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader eyebrow={`Episode ${episode.number} · ${shots.length} shots · ${totalSec}s · ${state.aspect}`} title={episode.title}>
        <button className="btn btn-ghost btn-sm" disabled={busy === `script-${episode.number}`} onClick={() => run(`script-${episode.number}`, `${base}/script`, {})}>
          {busy === `script-${episode.number}` ? "Rewriting…" : "Rewrite script"}
        </button>
      </SectionHeader>

      {/* Pipeline bar */}
      <div className="card mb-8 grid gap-4 p-5 lg:grid-cols-3">
        <Stage n="1" title="Storyboard" sub={charsPending ? "Waiting for character sheets to finish…" : charsReady ? "Approve every frame before rendering video." : "Tip: generate character sheets first (Season tab) for consistent faces."}>
          <button className="btn btn-primary btn-sm" disabled={busy === "frames" || charsPending || framesMissing.length === 0} onClick={() => run("frames", `${base}/frames`, {})}>
            {framesMissing.length === 0 ? "Frames ready" : `Generate ${framesMissing.length} frames · ${framesMissing.length} cr`}
          </button>
        </Stage>
        <Stage n="2" title="Render video" sub="Each approved frame becomes a shot with native sound.">
          <div className="flex flex-wrap gap-2">
            <select className="input !w-auto !py-1.5 text-xs" value={quality} onChange={(e) => setQuality(e.target.value as typeof quality)}>
              {QUALITY.map((q) => <option key={q.id} value={q.id}>{q.label} · {q.perSec} cr/s</option>)}
            </select>
            <button className="btn btn-primary btn-sm" disabled={!framesReady || busy === "render" || videosMissing.length === 0} onClick={() => run("render", `${base}/render`, { quality })}>
              {videosMissing.length === 0 ? "All rendered" : `Render ${videosMissing.length} shots · ${state.features.higgsfield ? renderCost : 0} cr`}
            </button>
          </div>
        </Stage>
        <Stage n="3" title="Final cut" sub="Stitch the shots into one vertical-ready MP4.">
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary btn-sm" disabled={!allVideos || busy === "stitch"} onClick={() => run("stitch", `${base}/stitch`, {})}>
              {busy === "stitch" ? "Stitching…" : episode.finalUrl ? "Re-stitch" : "Stitch episode"}
            </button>
            {episode.finalUrl && <a href={episode.finalUrl} download className="btn btn-ghost btn-sm">Download MP4</a>}
          </div>
        </Stage>
      </div>

      {episode.finalUrl && (
        <div className="card mb-8 grid gap-6 p-5 md:grid-cols-[minmax(0,320px)_1fr]">
          <video src={episode.finalUrl} controls playsInline className={`w-full rounded-xl bg-black ${state.aspect === "16:9" ? "aspect-video" : "aspect-[9/16]"}`} />
          <div>
            <p className="eyebrow mb-2">Caption</p>
            <p className="whitespace-pre-wrap text-sm">{episode.script?.caption}</p>
            <p className="mt-3 text-sm text-aura-2">{episode.script?.hashtags.join(" ")}</p>
            <button className="btn btn-ghost btn-sm mt-4" onClick={() => navigator.clipboard.writeText(`${episode.script?.caption ?? ""}\n\n${episode.script?.hashtags.join(" ") ?? ""}`)}>Copy caption</button>
          </div>
        </div>
      )}

      <div className={`grid gap-5 ${state.aspect === "16:9" ? "md:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
        {shots.map((shot) => (
          <ShotCard key={shot.id} ctx={ctx} shot={shot} base={base} quality={quality} perSec={perSec} />
        ))}
      </div>
    </div>
  );
}

function Stage({ n, title, sub, children }: { n: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-3 font-mono text-xs text-aura">{n}</span>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-muted">{sub}</p>
        </div>
      </div>
      <div className="pl-10">{children}</div>
    </div>
  );
}

function ShotCard({ ctx, shot, base, quality, perSec }: { ctx: StudioCtx; shot: ShotState; base: string; quality: string; perSec: number }) {
  const { state, busy, run } = ctx;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ imagePrompt: shot.imagePrompt, motionPrompt: shot.motionPrompt, dialogue: shot.dialogue ?? "", duration: shot.duration });
  const aspectCls = state.aspect === "16:9" ? "aspect-video" : "aspect-[9/16]";
  const framePending = shot.frameStatus === "pending";
  const videoPending = shot.videoStatus === "pending";

  async function save() {
    const ok = await run(`save-${shot.id}`, `/api/projects/${state.id}/shots/${shot.id}`, { ...draft, dialogue: draft.dialogue || null }, "PATCH");
    if (ok) setEditing(false);
  }

  return (
    <div className="card overflow-hidden">
      <div className={`relative ${aspectCls} bg-ink-3`}>
        {shot.videoUrl ? (
          <video src={shot.videoUrl} poster={shot.frameUrl ?? undefined} controls playsInline className="h-full w-full object-cover" />
        ) : shot.frameUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shot.frameUrl} alt={shot.description} className="h-full w-full object-cover" />
        ) : framePending ? (
          <div className="shimmer h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted">{shot.description}</div>
        )}
        <span className="chip absolute left-3 top-3 bg-ink/80 !text-cream">#{shot.index + 1} · {shot.shotType} · {shot.duration}s</span>
        {(framePending || videoPending) && (
          <span className="chip absolute bottom-3 left-3 bg-ink/80 !text-aura-2"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aura-2" />{videoPending ? "Rendering video…" : "Drawing frame…"}</span>
        )}
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm">{shot.description}</p>
        {shot.dialogue && <p className="rounded-lg bg-ink p-2 text-xs italic text-cream/90">🗣 {shot.dialogue}</p>}
        {shot.onScreenText && <p className="text-xs text-aura-2">Text: {shot.onScreenText}</p>}
        {shot.error && <p className="text-xs text-bad">{shot.error}</p>}

        {editing ? (
          <div className="grid gap-2">
            <label className="eyebrow">Frame prompt</label>
            <textarea className="input text-xs" rows={5} value={draft.imagePrompt} onChange={(e) => setDraft({ ...draft, imagePrompt: e.target.value })} />
            <label className="eyebrow">Motion prompt</label>
            <textarea className="input text-xs" rows={3} value={draft.motionPrompt} onChange={(e) => setDraft({ ...draft, motionPrompt: e.target.value })} />
            <label className="eyebrow">Dialogue</label>
            <input className="input text-xs" value={draft.dialogue} onChange={(e) => setDraft({ ...draft, dialogue: e.target.value })} />
            <label className="eyebrow">Duration (3–15s)</label>
            <input type="number" min={3} max={15} className="input text-xs" value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: Math.max(3, Math.min(15, Number(e.target.value) || 3)) })} />
            <div className="flex gap-2">
              <button className="btn btn-primary btn-sm" disabled={busy === `save-${shot.id}`} onClick={save}>Save</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <details className="text-xs text-muted">
            <summary className="cursor-pointer text-cream/70">Prompts</summary>
            <p className="mt-2"><span className="text-cream/70">Frame:</span> {shot.imagePrompt}</p>
            <p className="mt-2"><span className="text-cream/70">Motion:</span> {shot.motionPrompt}</p>
          </details>
        )}

        <div className="flex flex-wrap gap-2 border-t border-line pt-3">
          {!editing && <button className="btn btn-ghost btn-sm" disabled={framePending || videoPending} onClick={() => setEditing(true)}>Edit</button>}
          <button className="btn btn-ghost btn-sm" disabled={framePending || videoPending || busy === `frame-${shot.id}`} onClick={() => run(`frame-${shot.id}`, `${base}/frames`, { shotIds: [shot.id] })}>
            {shot.frameUrl ? "Redraw frame" : "Draw frame"} · 1 cr
          </button>
          <button
            className="btn btn-ghost btn-sm"
            disabled={!shot.frameUrl || framePending || videoPending || busy === `video-${shot.id}`}
            onClick={() => run(`video-${shot.id}`, `${base}/render`, { shotIds: [shot.id], quality })}
          >
            {shot.videoUrl ? "Re-render" : "Render"} · {state.features.higgsfield ? shot.duration * perSec : 0} cr
          </button>
        </div>
      </div>
    </div>
  );
}
