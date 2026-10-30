import * as z from "zod/v4";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { env, features } from "@/lib/env";
import { PLANS, TOPUPS } from "@/lib/plans";
import { stripeClient } from "@/lib/stripe";

const Body = z.object({ item: z.string().max(40) });

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return Response.json({ error: "Sign in first" }, { status: 401 });
  if (!features.stripe) return Response.json({ error: "Billing isn't configured yet (STRIPE_SECRET_KEY missing)." }, { status: 503 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  const stripe = stripeClient();
  const dbUser = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  let customer = dbUser.stripeCustomerId;
  if (!customer) {
    const c = await stripe.customers.create({ email: dbUser.email, name: dbUser.name ?? undefined, metadata: { userId: dbUser.id } });
    customer = c.id;
    await db.user.update({ where: { id: dbUser.id }, data: { stripeCustomerId: customer } });
  }

  const plan = PLANS.find((p) => p.id === parsed.data.item);
  const topup = TOPUPS.find((t) => t.id === parsed.data.item);
  if (!plan && !topup) return Response.json({ error: "Unknown plan" }, { status: 400 });

  const session = plan
    ? await stripe.checkout.sessions.create({
        mode: "subscription",
        customer,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: plan.priceMonthly * 100,
              recurring: { interval: "month" },
              product_data: { name: `Aura Engine ${plan.name}`, description: `${plan.credits} credits every month` },
            },
          },
        ],
        subscription_data: { metadata: { userId: dbUser.id, plan: plan.id, credits: String(plan.credits) } },
        metadata: { userId: dbUser.id, kind: "plan", plan: plan.id },
        success_url: `${env.appUrl}/app/billing?success=1`,
        cancel_url: `${env.appUrl}/app/billing`,
      })
    : await stripe.checkout.sessions.create({
        mode: "payment",
        customer,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: topup!.price * 100,
              product_data: { name: `${topup!.credits} Aura Engine credits` },
            },
          },
        ],
        metadata: { userId: dbUser.id, kind: "topup", credits: String(topup!.credits) },
        success_url: `${env.appUrl}/app/billing?success=1`,
        cancel_url: `${env.appUrl}/app/billing`,
      });
  return Response.json({ url: session.url });
}
