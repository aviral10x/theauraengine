"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ProjectState } from "@/lib/project";
import { Logo } from "@/components/Logo";
import { api, type ApiError } from "./api";
import { DnaView } from "./DnaView";
import { ConceptsView } from "./ConceptsView";
import { SeasonView } from "./SeasonView";
import { EpisodeView } from "./EpisodeView";
import { PublishView } from "./PublishView";

export type Tab = "dna" | "concepts" | "season" | `ep-${number}` | "publish";
export type StudioUser = { email: string; credits: number } | null;

export type StudioCtx = {
  state: ProjectState;
  user: StudioUser;
  busy: string | null;
  run: (key: string, path: string, body?: unknown, method?: string) => Promise<boolean>;
  setTab: (t: Tab) => void;
};

export function Studio({ initial, user: initialUser }: { initial: ProjectState; user: StudioUser }) {
  const [state, setState] = useState(initial);
  const [user, setUser] = useState(initialUser);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [tab, setTab] = useState<Tab>(initial.episodes.some((e) => e.shots.length) ? `ep-${initial.episodes.find((e) => e.shots.length)!.number}` : initial.series ? "season" : "dna");

  const refreshUser = useCallback(async () => {
    const r = await fetch("/api/me").then((x) => x.json()).catch(() => null);
    if (r) setUser(r.user);
  }, []);

  const run = useCallback(
    async (key: string, path: string, body?: unknown, method?: string) => {
      setBusy(key);
      setError(null);
      const { data, error } = await api(path, { method, body });
      setBusy(null);
      if (error) {
        setError(error);
        return false;
      }
      if (data) setState(data);
      void refreshUser();
      return true;
    },
    [refreshUser],
  );

  // Poll while generations are running.
  useEffect(() => {
    if (state.pending === 0) return;
    const t = setInterval(async () => {
      const { data } = await api(`/api/projects/${state.id}`, { method: "GET" });
      if (data) setState(data);
      if (data && data.pending === 0) void refreshUser();
    }, 5000);
    return () => clearInterval(t);
  }, [state.pending, state.id, refreshUser]);

  const ctx: StudioCtx = { state, user, busy, run, setTab };
  const activeEpisode = tab.startsWith("ep-") ? state.episodes.find((e) => `ep-${e.number}` === tab) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-ink/85 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-4">
            <Logo href={user ? "/app" : "/"} />
            <span className="hidden truncate text-sm text-muted sm:inline">/ {state.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {state.pending > 0 && <span className="chip !text-aura-2"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aura-2" /> {state.pending} rendering</span>}
            {user ? (
              <Link href="/app/billing" className="btn btn-ghost btn-sm">{user.credits} credits</Link>
            ) : (
              <Link href={`/signup?next=/p/${state.id}`} className="btn btn-primary btn-sm">Save &amp; continue free</Link>
            )}
          </div>
        </div>
        {(!state.features.claude || !state.features.higgsfield) && (
          <div className="border-t border-line bg-aura/10 px-4 py-1.5 text-center text-xs text-aura-2">
            Demo mode: {!state.features.claude && "ANTHROPIC_API_KEY"} {!state.features.claude && !state.features.higgsfield && "and"}{" "}
            {!state.features.higgsfield && "HF_API_KEY_ID / HF_API_KEY_SECRET"} not set. Outputs are placeholders.
          </div>
        )}
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="border-b border-line lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          <nav className="flex gap-1 overflow-x-auto p-3 lg:sticky lg:top-14 lg:flex-col">
            <NavItem active={tab === "dna"} onClick={() => setTab("dna")} n="1" label="Brand & Story DNA" />
            <NavItem active={tab === "concepts"} onClick={() => setTab("concepts")} n="2" label="Formats & concepts" />
            <NavItem active={tab === "season"} onClick={() => setTab("season")} n="3" label="Season & characters" disabled={!state.series} />
            {state.episodes.length > 0 && <p className="eyebrow hidden px-3 pb-1 pt-4 lg:block">Episodes</p>}
            {state.episodes.map((e) => (
              <NavItem
                key={e.id}
                active={tab === `ep-${e.number}`}
                onClick={() => setTab(`ep-${e.number}`)}
                n={`E${e.number}`}
                label={e.title}
                dot={e.finalUrl ? "ok" : e.shots.some((s) => s.frameStatus === "pending" || s.videoStatus === "pending") ? "busy" : e.shots.length ? "wip" : undefined}
              />
            ))}
            <NavItem active={tab === "publish"} onClick={() => setTab("publish")} n="★" label="Publish & distribute" />
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-8">
          {error && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm">
              <span>{error.message}</span>
              <span className="flex gap-2">
                {error.code === "auth" && <Link href={`/signup?next=/p/${state.id}`} className="btn btn-primary btn-sm">Create free account</Link>}
                {error.code === "credits" && <Link href="/app/billing" className="btn btn-primary btn-sm">Get credits</Link>}
                <button onClick={() => setError(null)} className="btn btn-ghost btn-sm">Dismiss</button>
              </span>
            </div>
          )}
          {tab === "dna" && <DnaView ctx={ctx} />}
          {tab === "concepts" && <ConceptsView ctx={ctx} />}
          {tab === "season" && <SeasonView ctx={ctx} />}
          {activeEpisode && <EpisodeView ctx={ctx} episode={activeEpisode} />}
          {tab === "publish" && <PublishView ctx={ctx} />}
        </main>
      </div>
    </div>
  );
}

function NavItem({ active, onClick, n, label, disabled, dot }: { active: boolean; onClick: () => void; n: string; label: string; disabled?: boolean; dot?: "ok" | "busy" | "wip" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition disabled:opacity-35 ${active ? "bg-ink-3 text-cream" : "text-muted hover:bg-ink-2 hover:text-cream"}`}
    >
      <span className={`flex h-6 min-w-6 items-center justify-center rounded-md px-1 font-mono text-[10px] ${active ? "bg-aura text-ink" : "bg-ink-3"}`}>{n}</span>
      <span className="max-w-[11rem] truncate">{label}</span>
      {dot && <span className={`ml-auto h-1.5 w-1.5 rounded-full ${dot === "ok" ? "bg-ok" : dot === "busy" ? "animate-pulse bg-aura-2" : "bg-muted"}`} />}
    </button>
  );
}

export function SectionHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="font-display text-4xl sm:text-5xl">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function SignupGate({ state, what }: { state: ProjectState; what: string }) {
  return (
    <div className="card flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
      <div>
        <p className="font-display text-2xl">Create a free account to {what}</p>
        <p className="text-sm text-muted">Your scan is saved automatically. You get 40 credits to start.</p>
      </div>
      <Link href={`/signup?next=/p/${state.id}`} className="btn btn-primary">Continue free</Link>
    </div>
  );
}
