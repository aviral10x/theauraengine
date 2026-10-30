import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { features } from "@/lib/env";
import { PLANS, TOPUPS } from "@/lib/plans";
import { CheckoutButton } from "@/components/CheckoutButton";

export const metadata = { title: "Billing · Aura Engine" };

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ success?: string; plan?: string }> }) {
  const { success, plan } = await searchParams;
  const user = await requireUser("/app/billing");
  const ledger = await db.creditLedger.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 40 });

  return (
    <div>
      <p className="eyebrow mb-2">Billing</p>
      <h1 className="font-display text-5xl">{user.credits} credits</h1>
      <p className="mt-2 text-muted">Current plan: <span className="text-cream">{user.plan}</span>. 1 credit ≈ one storyboard frame; video costs 1–4 credits per second depending on quality.</p>
      {success && <div className="mt-6 rounded-xl border border-ok/40 bg-ok/10 p-4 text-sm">Payment received. Credits appear within a few seconds (refresh if needed).</div>}
      {!features.stripe && <div className="mt-6 rounded-xl border border-aura/40 bg-aura/10 p-4 text-sm text-aura-2">Stripe isn&apos;t configured (STRIPE_SECRET_KEY). Checkout buttons are disabled.</div>}

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {PLANS.map((p) => (
          <div key={p.id} className={`card flex flex-col p-7 ${plan === p.id ? "!border-aura" : ""}`}>
            <p className="font-display text-3xl">{p.name}</p>
            <p className="mt-1 text-sm text-muted">{p.blurb}</p>
            <p className="mt-5 font-display text-5xl">${p.priceMonthly}<span className="text-lg text-muted">/mo</span></p>
            <ul className="mt-5 flex-1 space-y-1.5 text-sm text-muted">{p.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
            <CheckoutButton item={p.id} label={user.plan === p.id ? "Current plan" : `Subscribe to ${p.name}`} disabled={!features.stripe || user.plan === p.id} primary={plan === p.id || p.id === "brand"} />
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-12 font-display text-3xl">Top up</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {TOPUPS.map((t) => (
          <div key={t.id} className="card flex items-center justify-between p-5">
            <div>
              <p className="font-display text-2xl">{t.credits} credits</p>
              <p className="text-sm text-muted">${t.price} one-time · never expire</p>
            </div>
            <CheckoutButton item={t.id} label="Buy" disabled={!features.stripe} />
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-12 font-display text-3xl">History</h2>
      <div className="card divide-y divide-line">
        {ledger.length === 0 && <p className="p-5 text-sm text-muted">No activity yet.</p>}
        {ledger.map((l) => (
          <div key={l.id} className="flex items-center justify-between px-5 py-3 text-sm">
            <span className="text-muted">{l.reason}</span>
            <span className="flex items-center gap-6">
              <span className="text-xs text-muted">{l.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
              <span className={`w-14 text-right font-mono ${l.delta > 0 ? "text-ok" : "text-cream"}`}>{l.delta > 0 ? `+${l.delta}` : l.delta}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
