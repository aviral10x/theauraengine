"use client";

import { useState } from "react";

export function CheckoutButton({ item, label, disabled, primary }: { item: string; label: string; disabled?: boolean; primary?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="mt-6">
      <button
        className={`btn w-full ${primary ? "btn-primary" : "btn-ghost"}`}
        disabled={disabled || busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          const res = await fetch("/api/billing/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ item }) });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.url) window.location.href = data.url;
          else {
            setError(data.error || "Checkout failed");
            setBusy(false);
          }
        }}
      >
        {busy ? "Redirecting…" : label}
      </button>
      {error && <p className="mt-2 text-xs text-bad">{error}</p>}
    </div>
  );
}
