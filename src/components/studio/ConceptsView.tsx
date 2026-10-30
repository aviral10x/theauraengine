"use client";

import { useState } from "react";
import { FORMATS, getFormat } from "@/lib/formats";
import type { StudioCtx } from "./Studio";
import { SectionHeader, SignupGate } from "./Studio";

export function ConceptsView({ ctx }: { ctx: StudioCtx }) {
  const { state, user, busy, run } = ctx;
  const { scan } = state;
  const [conceptIdx, setConceptIdx] = useState(state.conceptIdx ?? 0);
  const [formatId, setFormatId] = useState(state.formatId ?? scan.concepts[0]?.formatId ?? FORMATS[0].id);
  const format = getFormat(formatId);
  const [episodes, setEpisodes] = useState(format.defaultEpisodes);
  const [direction, setDirection] = useState("");

  const pick = (i: number) => {
    setConceptIdx(i);
    const f = getFormat(scan.concepts[i].formatId);
    setFormatId(f.id);
    setEpisodes(f.defaultEpisodes);
  };

  async function writeSeason() {
    const ok = await run("series", `/api/projects/${state.id}/series`, { conceptIdx, formatId, episodes, direction: direction || undefined });
    if (ok) ctx.setTab("season");
  }

  return (
    <div>
      <SectionHeader eyebrow="Step 2" title="Formats & concepts" />

      <p className="eyebrow mb-3">Format fit for {scan.brand.name}</p>
      <div className="mb-12 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {scan.formatRanking.map((r) => {
          const f = getFormat(r.formatId);
          return (
            <button
              key={r.formatId}
              onClick={() => setFormatId(f.id)}
              className={`card p-4 text-left transition hover:border-aura/50 ${formatId === f.id ? "!border-aura" : ""}`}
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-xl">{f.name}</p>
                <span className="font-mono text-sm text-aura-2">{r.score}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-3">
                <div className="h-full bg-gradient-to-r from-aura to-aura-2" style={{ width: `${r.score}%` }} />
              </div>
              <p className="mt-2 line-clamp-3 text-xs text-muted">{r.why || f.tagline}</p>
            </button>
          );
        })}
      </div>

      <p className="eyebrow mb-3">Series concepts</p>
      <div className="grid gap-5 lg:grid-cols-3">
        {scan.concepts.map((c, i) => (
          <button key={c.title + i} onClick={() => pick(i)} className={`card flex flex-col p-6 text-left transition hover:border-aura/50 ${conceptIdx === i ? "!border-aura shadow-[0_0_50px_-25px_rgba(255,122,69,0.8)]" : ""}`}>
            <span className="chip mb-3 self-start">{getFormat(c.formatId).name}</span>
            <p className="font-display text-3xl leading-tight">{c.title}</p>
            <p className="mt-2 text-sm text-cream/90">{c.logline}</p>
            <div className="mt-4 rounded-xl bg-ink p-3 text-sm">
              <p className="eyebrow mb-1">Opening hook</p>
              <p className="italic text-cream/90">&ldquo;{c.hook}&rdquo;</p>
            </div>
            <p className="mt-4 text-xs text-muted"><span className="text-cream/80">Lead:</span> {c.mainCharacter}</p>
            <p className="mt-1 text-xs text-muted"><span className="text-cream/80">Product role:</span> {c.productRole}</p>
            <ul className="mt-4 space-y-1 text-xs text-muted">
              {c.episodeIdeas.map((e, j) => <li key={e + j}>E{j + 1} · {e}</li>)}
            </ul>
            <p className="mt-4 border-t border-line pt-3 text-xs text-aura-2">{c.whyItWorks}</p>
          </button>
        ))}
      </div>

      <div className="mt-10">
        {!user ? (
          <SignupGate state={state} what="write this season" />
        ) : (
          <div className="card grid gap-5 p-6 lg:grid-cols-[1fr_auto]">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm">
                <span className="eyebrow mb-1.5 block">Format</span>
                <select className="input" value={formatId} onChange={(e) => { setFormatId(e.target.value); setEpisodes(getFormat(e.target.value).defaultEpisodes); }}>
                  {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </label>
              <label className="text-sm">
                <span className="eyebrow mb-1.5 block">Episodes</span>
                <input type="number" min={1} max={12} className="input" value={episodes} onChange={(e) => setEpisodes(Math.max(1, Math.min(12, Number(e.target.value) || 1)))} />
              </label>
              <div className="text-sm">
                <span className="eyebrow mb-1.5 block">Per episode</span>
                <p className="py-3 text-muted">{format.episodeSeconds[0]}–{format.episodeSeconds[1]}s · {format.aspect}</p>
              </div>
              <label className="text-sm sm:col-span-3">
                <span className="eyebrow mb-1.5 block">Creative direction (optional)</span>
                <input className="input" value={direction} onChange={(e) => setDirection(e.target.value)} placeholder="e.g. Set it in Dubai, make the villain a rival app, keep it family-friendly" />
              </label>
            </div>
            <div className="flex flex-col justify-end gap-2">
              <button className="btn btn-primary" disabled={busy === "series"} onClick={writeSeason}>
                {busy === "series" ? "Writing season…" : state.series ? "Rewrite season" : "Write the season"}
              </button>
              <p className="text-center text-xs text-muted">{state.features.claude ? "3 credits" : "Free in demo mode"}{state.series ? " · replaces current episodes" : ""}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
