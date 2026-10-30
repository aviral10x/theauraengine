import type Stripe from "stripe";
import { db } from "@/lib/db";
import { env, features } from "@/lib/env";
import { grantCredits } from "@/lib/credits";
import { PLANS } from "@/lib/plans";
import { stripeClient } from "@/lib/stripe";

export async function POST(req: Request) {
  if (!features.stripe || !env.stripeWebhookSecret) return new Response("Not configured", { status: 503 });
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(raw, sig ?? "", env.stripeWebhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const userId = s.metadata?.userId;
    if (userId && s.metadata?.kind === "topup" && s.payment_status === "paid") {
      await grantCredits(userId, Number(s.metadata.credits || 0), "topup", `stripe:${s.id}`);
    }
    if (userId && s.metadata?.kind === "plan") {
      await db.user.update({ where: { id: userId }, data: { plan: s.metadata.plan ?? "creator" } });
    }
  }

  // Every paid subscription invoice (first + renewals) grants that plan's monthly credits.
  if (event.type === "invoice.paid") {
    const inv = event.data.object as Stripe.Invoice;
    const customer = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
    const user = customer ? await db.user.findUnique({ where: { stripeCustomerId: customer } }) : null;
    const line = inv.lines?.data?.[0] as (Stripe.InvoiceLineItem & { metadata?: Record<string, string> }) | undefined;
    const planId = line?.metadata?.plan || user?.plan;
    const plan = PLANS.find((p) => p.id === planId) ?? PLANS.find((p) => Math.round(inv.amount_paid / 100) === p.priceMonthly);
    if (user && plan && inv.amount_paid > 0) {
      await db.user.update({ where: { id: user.id }, data: { plan: plan.id } });
      await grantCredits(user.id, plan.credits, `plan:${plan.id}`, `stripe:${inv.id}`);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    await db.user.updateMany({ where: { stripeCustomerId: customer }, data: { plan: "free" } });
  }

  return Response.json({ received: true });
}
