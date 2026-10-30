"use client";

import type { StudioCtx } from "./Studio";
import { SectionHeader } from "./Studio";

function List({ title, items, tone = "muted" }: { title: string; items: string[]; tone?: "muted" | "warn" }) {
  if (!items?.length) return null;
  return (
    <div className="card p-5">
      <p className="eyebrow mb-3">{title}</p>
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i} className={`flex gap-2 ${tone === "warn" ? "text-aura-2" : "text-cream/90"}`}>
            <span className="text-aura">•</span>
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DnaView({ ctx }: { ctx: StudioCtx }) {
  const { scan, site, url } = ctx.state;
  const { brand, story, compliance } = scan;
  return (
    <div>
      <SectionHeader eyebrow={`Scan of ${ctx.state.domain}`} title={brand.name}>
        <a href={url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Open site ↗</a>
        <button onClick={() => ctx.setTab("concepts")} className="btn btn-primary btn-sm">See series concepts →</button>
      </SectionHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          {site.ogImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.ogImage} alt="" className="h-48 w-full object-cover opacity-80" />
          )}
          <div className="p-6">
            <p className="eyebrow mb-2">Brand DNA</p>
            <p className="font-display text-3xl leading-tight">{brand.oneLiner}</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-2">Audience</p>
                <p className="text-sm text-cream/90">{brand.audience}</p>
              </div>
              <div>
                <p className="eyebrow mb-2">Category</p>
                <p className="text-sm text-cream/90">{brand.category}</p>
              </div>
              <div>
                <p className="eyebrow mb-2">Voice</p>
                <div className="flex flex-wrap gap-1.5">{brand.voice.map((v) => <span key={v} className="chip !text-cream">{v}</span>)}</div>
              </div>
              <div>
                <p className="eyebrow mb-2">Palette</p>
                <div className="flex gap-2">
                  {brand.palette.map((c) => (
                    <span key={c} className="flex flex-col items-center gap-1">
                      <span className="h-9 w-9 rounded-full border border-line" style={{ background: /^#[0-9a-f]{3,8}$/i.test(c) ? c : "#333" }} />
                      <span className="font-mono text-[10px] text-muted">{c}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <p className="eyebrow mb-3">Products</p>
          <div className="space-y-3">
            {brand.products.map((p) => (
              <div key={p.name} className="flex gap-3">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover" />
                ) : (
                  <span className="h-14 w-14 shrink-0 rounded-lg bg-ink-3" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="line-clamp-2 text-xs text-muted">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
          {brand.proofPoints.length > 0 && (
            <>
              <p className="eyebrow mb-2 mt-6">Proof points</p>
              <ul className="space-y-1 text-xs text-muted">{brand.proofPoints.map((p) => <li key={p}>• {p}</li>)}</ul>
            </>
          )}
        </div>
      </div>

      <h2 className="mb-4 mt-12 font-display text-3xl">Story DNA</h2>
      <p className="-mt-2 mb-5 max-w-2xl text-sm text-muted">The raw material for series: what your audience feels, wants and fights against, and where your product naturally lives.</p>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <List title="Tensions" items={story.tensions} />
        <List title="Desires" items={story.desires} />
        <List title="Villains" items={story.villains} />
        <List title="Worlds" items={story.worlds} />
        <List title="Hooks" items={story.hooks} />
        <div className="card p-5">
          <p className="eyebrow mb-3">Character ideas</p>
          <div className="space-y-3">
            {story.characterIdeas.map((c) => (
              <div key={c.name}>
                <p className="text-sm font-semibold">{c.name} <span className="font-normal text-muted">· {c.archetype}</span></p>
                <p className="text-xs text-muted">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="mb-4 mt-12 font-display text-3xl">Compliance guardrails</h2>
      <div className="grid gap-5 md:grid-cols-3">
        <List title="Flags" items={compliance.flags} tone="warn" />
        <List title="Never claim" items={compliance.avoidClaims} tone="warn" />
        <div className="card p-5">
          <p className="eyebrow mb-3">Disclosure line</p>
          <p className="text-sm">{compliance.disclosure}</p>
          <p className="mt-3 text-xs text-muted">Added to every caption. Required by Instagram&apos;s AI labels, the EU AI Act and NY&apos;s synthetic performer law.</p>
        </div>
      </div>
    </div>
  );
}
