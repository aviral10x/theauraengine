"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STAGES = [
  "Crawling your website",
  "Reading products, voice and visuals",
  "Building Brand DNA",
  "Finding the stories in your brand (Story DNA)",
  "Matching formats proven on 700M+ views",
  "Writing three series concepts",
];

export function ScanBox({ initialUrl = "", autoStart = false, size = "lg" }: { initialUrl?: string; autoStart?: boolean; size?: "lg" | "md" }) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<{ msg: string; signup?: boolean } | null>(null);
  const started = useRef(false);

  async function run(target: string) {
    if (!target.trim() || busy) return;
    setBusy(true);
    setError(null);
    setStage(0);
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 6500);
    try {
      const res = await fetch("/api/scan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: target }) });
      const data = await res.json();
      if (!res.ok) {
        setError({ msg: data.error || "Scan failed", signup: res.status === 429 });
        setBusy(false);
      } else {
        router.push(`/p/${data.id}`);
      }
    } catch {
      setError({ msg: "Network error. Please try again." });
      setBusy(false);
    } finally {
      clearInterval(timer);
    }
  }

  useEffect(() => {
    if (autoStart && initialUrl && !started.current) {
      started.current = true;
      void run(initialUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, initialUrl]);

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(url);
        }}
        className={`flex w-full flex-col gap-2 rounded-[1.4rem] border border-line bg-ink-2/90 p-2 shadow-[0_0_80px_-20px_rgba(255,122,69,0.45)] sm:flex-row ${size === "lg" ? "sm:p-2.5" : ""}`}
      >
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yourbrand.com"
          aria-label="Your website URL"
          disabled={busy}
          className={`min-w-0 flex-1 bg-transparent px-4 text-cream placeholder:text-muted/60 outline-none ${size === "lg" ? "py-3.5 text-lg" : "py-2.5"}`}
        />
        <button type="submit" disabled={busy} className={`btn btn-primary ${size === "lg" ? "px-6 py-3.5 text-base" : ""}`}>
          {busy ? "Scanning…" : "Scan my brand. It's free"}
        </button>
      </form>

      {busy && (
        <div className="mt-5 rounded-2xl border border-line bg-ink-2/80 p-5 text-left">
          <ol className="space-y-2.5">
            {STAGES.map((s, i) => (
              <li key={s} className={`flex items-center gap-3 text-sm transition ${i <= stage ? "text-cream" : "text-muted/40"}`}>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                    i < stage ? "bg-aura text-ink" : i === stage ? "border border-aura text-aura animate-pulse" : "border border-line"
                  }`}
                >
                  {i < stage ? "✓" : i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-muted">Takes about 30–90 seconds. Don&apos;t close this tab.</p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-bad">
          {error.msg}{" "}
          {error.signup && (
            <Link href="/signup" className="underline text-cream">
              Create a free account
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
