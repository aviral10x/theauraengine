"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

const STAGES = [
  "Crawling your website",
  "Reading products, voice and visuals",
  "Building Brand DNA",
  "Finding the stories in your brand",
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
    if (!target.trim()) {
      setError({ msg: "Paste your website address first, e.g. yourbrand.com" });
      return;
    }
    if (busy) return;
    setBusy(true);
    setError(null);
    setStage(0);
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 6500);
    try {
      const res = await fetch("/api/scan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: target }) });
      const data = await res.json().catch(() => ({}));
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

  const lg = size === "lg";
  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(url);
        }}
        className={`group glass relative flex w-full items-center gap-2 rounded-full p-1.5 transition focus-within:border-aura/50 focus-within:shadow-[0_0_0_4px_rgba(255,90,31,0.12),0_30px_80px_-30px_rgba(255,90,31,0.6)] ${lg ? "sm:p-2" : ""}`}
      >
        <span className={`pl-4 font-mono text-xs text-muted ${lg ? "hidden sm:inline" : "hidden"}`}>https://</span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yourbrand.com"
          aria-label="Your website URL"
          disabled={busy}
          className={`min-w-0 flex-1 bg-transparent text-cream placeholder:text-cream/30 outline-none ${lg ? "py-3 pl-3 text-lg sm:pl-1" : "py-2.5 pl-4"}`}
        />
        <button type="submit" disabled={busy} className={`btn btn-primary ${lg ? "px-6 py-3.5 text-[15px]" : ""}`}>
          {busy ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink/40 border-t-ink" /> Scanning
            </>
          ) : (
            <>Scan my brand <span aria-hidden>→</span></>
          )}
        </button>
      </form>

      <AnimatePresence>
        {busy && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass mt-4 overflow-hidden rounded-3xl p-5 text-left"
          >
            <ol className="space-y-2.5">
              {STAGES.map((s, i) => (
                <li key={s} className={`flex items-center gap-3 text-sm transition duration-500 ${i <= stage ? "text-cream" : "text-cream/25"}`}>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${i < stage ? "bg-aura text-ink" : i === stage ? "animate-pulse border border-aura text-aura" : "border border-line"}`}>
                    {i < stage ? "✓" : i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            <div className="mt-4 h-px overflow-hidden bg-line">
              <motion.div className="h-full bg-gradient-to-r from-aura to-aura-2" animate={{ width: `${((stage + 1) / STAGES.length) * 100}%` }} transition={{ duration: 0.8 }} />
            </div>
            <p className="mt-3 text-xs text-muted">Takes about 30–90 seconds. Keep this tab open.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-3 text-sm text-bad">
          {error.msg}{" "}
          {error.signup && <Link href="/signup" className="text-cream underline">Create a free account</Link>}
        </p>
      )}
    </div>
  );
}
