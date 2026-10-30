"use client";

import { getFormat } from "@/lib/formats";
import type { StudioCtx } from "./Studio";
import { SectionHeader } from "./Studio";

export function SeasonView({ ctx }: { ctx: StudioCtx }) {
  const { state, busy, run } = ctx;
  const s = state.series;
  if (!s) return null;
  const format = getFormat(state.formatId);
  const pendingChars = state.characters.some((c) => c.status === "pending");

  return (
    <div>
      <SectionHeader eyebrow={`${format.name} · ${state.episodes.length} episodes`} title={s.title}>
        <button className="btn btn-ghost btn-sm" onClick={() => ctx.setTab("concepts")}>Change concept</button>
      </SectionHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <p className="eyebrow mb-2">Logline</p>
          <p className="font-display text-2xl leading-snug">{s.logline}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><p className="eyebrow mb-1">Tone</p><p className="text-sm text-cream/90">{s.tone}</p></div>
            <div><p className="eyebrow mb-1">Setting</p><p className="text-sm text-cream/90">{s.setting}</p></div>
            <div className="sm:col-span-2"><p className="eyebrow mb-1">Product integration</p><p className="text-sm text-cream/90">{s.productIntegration}</p></div>
            <div className="sm:col-span-2"><p className="eyebrow mb-1">Visual style (applied to every shot)</p><p className="text-sm text-muted">{s.visualStyle}</p></div>
          </div>
        </div>
        <div className="card p-6">
          <p className="eyebrow mb-3">Production checklist</p>
          <ol className="space-y-3 text-sm">
            <Check done={state.characters.every((c) => c.status === "done" || c.status === "demo")} label="Lock character sheets" />
            <Check done={state.episodes.some((e) => e.shots.length > 0)} label="Write episode shot lists" />
            <Check done={state.episodes.some((e) => e.shots.length > 0 && e.shots.every((x) => x.frameStatus === "done" || x.frameStatus === "demo"))} label="Approve storyboards" />
            <Check done={state.episodes.some((e) => e.finalUrl)} label="Render & stitch an episode" />
          </ol>
        </div>
      </div>

      <div className="mt-12 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-3xl">Cast</h2>
          <p className="text-sm text-muted">Character sheets are used as references for every frame, so faces and outfits stay consistent.</p>
        </div>
        <button className="btn btn-primary btn-sm" disabled={busy === "chars" || pendingChars} onClick={() => run("chars", `/api/projects/${state.id}/characters`, {})}>
          {pendingChars ? "Generating…" : state.characters.some((c) => c.imageUrl) ? "Regenerate all sheets" : "Generate character sheets"} · {state.characters.length * 2} cr
        </button>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {state.characters.map((c) => (
          <div key={c.key} className="card overflow-hidden">
            <div className="relative aspect-video bg-ink-3">
              {c.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover" />
              ) : c.status === "pending" ? (
                <div className="shimmer h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted">{c.status === "failed" ? c.error ?? "Failed" : "No sheet yet"}</div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="font-display text-2xl">{c.name}</p>
                <button className="btn btn-ghost btn-sm" disabled={c.status === "pending" || busy === `char-${c.key}`} onClick={() => run(`char-${c.key}`, `/api/projects/${state.id}/characters`, { keys: [c.key] })}>
                  {c.imageUrl ? "Redo" : "Generate"}
                </button>
              </div>
              <p className="text-xs text-aura-2">{c.role}</p>
              <p className="mt-2 text-xs text-muted">{c.visualDescription}</p>
              <p className="mt-2 text-xs text-cream/70">{c.personality}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-5 mt-12 font-display text-3xl">Episodes</h2>
      <div className="grid gap-4">
        {state.episodes.map((e) => (
          <div key={e.id} className="card flex flex-col gap-4 p-5 md:flex-row md:items-center">
            <span className="font-display text-4xl text-aura">{String(e.number).padStart(2, "0")}</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl">{e.title}</p>
              <p className="text-sm text-cream/80"><span className="text-muted">Hook:</span> {e.outline.hook}</p>
              <p className="text-sm text-muted">{e.outline.synopsis}</p>
              <p className="text-xs text-aura-2">Ends on: {e.outline.cliffhanger}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {e.shots.length > 0 && <button className="btn btn-ghost btn-sm" onClick={() => ctx.setTab(`ep-${e.number}`)}>Open</button>}
              <button
                className={`btn btn-sm ${e.shots.length ? "btn-ghost" : "btn-primary"}`}
                disabled={busy === `script-${e.number}`}
                onClick={async () => {
                  const ok = await run(`script-${e.number}`, `/api/projects/${state.id}/episodes/${e.number}/script`, {});
                  if (ok) ctx.setTab(`ep-${e.number}`);
                }}
              >
                {busy === `script-${e.number}` ? "Writing…" : e.shots.length ? "Rewrite" : "Write shot list"} · {state.features.claude ? "1 cr" : "free"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Check({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${done ? "bg-ok text-ink" : "border border-line"}`}>{done ? "✓" : ""}</span>
      <span className={done ? "text-cream" : "text-muted"}>{label}</span>
    </li>
  );
}
