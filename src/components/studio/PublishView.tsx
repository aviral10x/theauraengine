"use client";

import { LeadForm } from "@/components/LeadForm";
import type { StudioCtx } from "./Studio";
import { SectionHeader } from "./Studio";

export function PublishView({ ctx }: { ctx: StudioCtx }) {
  const { state } = ctx;
  const finished = state.episodes.filter((e) => e.finalUrl);

  return (
    <div>
      <SectionHeader eyebrow="Final step" title="Publish & distribute" />

      <h2 className="mb-4 font-display text-3xl">Finished episodes</h2>
      {finished.length === 0 ? (
        <div className="card p-6 text-sm text-muted">No stitched episodes yet. Render every shot of an episode, then hit &ldquo;Stitch episode&rdquo;.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {finished.map((e) => (
            <div key={e.id} className="card overflow-hidden">
              <video src={e.finalUrl!} controls playsInline className={`w-full bg-black ${state.aspect === "16:9" ? "aspect-video" : "aspect-[9/16]"}`} />
              <div className="space-y-2 p-4">
                <p className="font-display text-xl">E{e.number} · {e.title}</p>
                <p className="line-clamp-3 whitespace-pre-wrap text-xs text-muted">{e.script?.caption}</p>
                <div className="flex gap-2">
                  <a href={e.finalUrl!} download className="btn btn-primary btn-sm">Download</a>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(`${e.script?.caption ?? ""}\n\n${e.script?.hashtags.join(" ") ?? ""}`)}>Copy caption</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-line bg-ink-2 p-4 text-xs text-muted">
        <span className="text-cream">Posting checklist:</span> turn on Instagram&apos;s &ldquo;AI info&rdquo; label / TikTok&apos;s AI-generated content toggle, keep the disclosure line in the caption
        (&ldquo;{state.scan.compliance.disclosure}&rdquo;), and post episodes in order on a steady cadence. Series compound when they&apos;re consistent.
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <p className="eyebrow mb-2">Distribution</p>
          <h3 className="font-display text-3xl">Boost on the Aura Network</h3>
          <p className="mb-5 mt-2 text-sm text-muted">
            Placements on Aura-owned pages (550K+ followers), our micro-drama page network, and vetted clipper campaigns priced per 1,000 verified views.
          </p>
          <LeadForm type="distribution" projectId={state.id} defaultUrl={state.url} cta="Request a distribution plan" compact />
        </div>
        <div className="card p-6">
          <p className="eyebrow mb-2">InkFrame Studio</p>
          <h3 className="font-display text-3xl">Send to the studio</h3>
          <p className="mb-5 mt-2 text-sm text-muted">
            Our producers get your Brand DNA, series bible, characters and storyboards attached, and reply with a concept route and timeline for a human-directed version.
          </p>
          <LeadForm type="studio" projectId={state.id} defaultUrl={state.url} cta="Send to InkFrame" compact />
        </div>
      </div>
    </div>
  );
}
