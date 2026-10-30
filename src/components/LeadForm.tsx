"use client";

import { useState } from "react";

export function LeadForm({
  type,
  projectId,
  defaultUrl,
  cta = "Send",
  compact = false,
}: {
  type: "studio" | "distribution" | "contact";
  projectId?: string;
  defaultUrl?: string;
  cta?: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(Array.from(fd.entries()).filter(([, v]) => String(v).trim() !== ""));
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...body, type, projectId }),
    });
    if (res.ok) setState("sent");
    else {
      setState("error");
      setError((await res.json().catch(() => ({}))).error || "Something went wrong");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-aura/40 bg-aura/10 p-5 text-sm">
        <p className="font-semibold text-cream">Got it. We&apos;ll be in touch within one business day.</p>
        <p className="mt-1 text-muted">
          {type === "studio" ? "An InkFrame producer will reply with a concept route and a timeline." : "We'll reply with placement options and a CPM quote."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className={`grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        <input name="name" required placeholder="Your name" className="input" />
        <input name="email" type="email" required placeholder="Work email" className="input" />
      </div>
      <div className={`grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        <input name="company" placeholder="Company" className="input" />
        <input name="url" placeholder="Website" defaultValue={defaultUrl} className="input" />
      </div>
      {type !== "contact" && (
        <select name="budget" className="input" defaultValue="">
          <option value="">{type === "distribution" ? "Distribution budget" : "Project budget"}</option>
          <option>Under $2,500</option>
          <option>$2,500 – $10,000</option>
          <option>$10,000 – $50,000</option>
          <option>$50,000+</option>
        </select>
      )}
      <textarea
        name="message"
        rows={compact ? 3 : 4}
        placeholder={type === "distribution" ? "Goals, target audience, markets, timing…" : "Tell us what you're making…"}
        className="input"
      />
      {state === "error" && <p className="text-sm text-bad">{error}</p>}
      <button className="btn btn-primary" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : cta}
      </button>
    </form>
  );
}
