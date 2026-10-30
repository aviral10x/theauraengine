"use client";

import { useState } from "react";
import Link from "next/link";

function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
}

export function AuthForm({ mode, next, plan }: { mode: "login" | "signup"; next?: string; plan?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setBusy(false);
      return;
    }
    const dest = plan ? `/app/billing?plan=${encodeURIComponent(plan)}` : safeNext(next);
    window.location.href = dest;
  }

  const q = new URLSearchParams();
  if (next) q.set("next", next);
  if (plan) q.set("plan", plan);
  const qs = q.toString() ? `?${q.toString()}` : "";

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      {mode === "signup" && <input name="name" placeholder="Your name" className="input" autoComplete="name" />}
      <input name="email" type="email" required placeholder="Email" className="input" autoComplete="email" />
      <input name="password" type="password" required minLength={mode === "signup" ? 8 : 1} placeholder={mode === "signup" ? "Password (8+ characters)" : "Password"} className="input" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
      {error && <p className="text-sm text-bad">{error}</p>}
      <button className="btn btn-primary mt-1" disabled={busy}>{busy ? "…" : mode === "signup" ? "Create account and get 40 credits" : "Sign in"}</button>
      <p className="text-center text-sm text-muted">
        {mode === "signup" ? (
          <>Already have an account? <Link href={`/login${qs}`} className="text-cream underline">Sign in</Link></>
        ) : (
          <>New here? <Link href={`/signup${qs}`} className="text-cream underline">Create a free account</Link></>
        )}
      </p>
    </form>
  );
}
