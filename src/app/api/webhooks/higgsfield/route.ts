import { Webhook } from "standardwebhooks";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { handleWebhook } from "@/lib/generation";

export const maxDuration = 60;

export async function POST(req: Request) {
  const raw = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  if (env.hfWebhookSecret) {
    try {
      new Webhook(env.hfWebhookSecret).verify(raw, headers);
    } catch {
      return new Response("Invalid signature", { status: 400 });
    }
  } else if (process.env.NODE_ENV === "production") {
    // Without a signing secret we can't trust the payload; status polling remains the source of truth.
    return new Response("Webhook secret not configured", { status: 503 });
  }

  let body: Parameters<typeof handleWebhook>[0];
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }
  if (!body?.request_id || !body?.status) return new Response("Bad payload", { status: 400 });

  const eventId = headers["webhook-id"];
  if (eventId) {
    const seen = await db.webhookEvent.findUnique({ where: { id: eventId } });
    if (seen) return Response.json({ ok: true, duplicate: true });
  }
  await handleWebhook(body);
  if (eventId) await db.webhookEvent.create({ data: { id: eventId, source: "higgsfield" } }).catch(() => undefined);
  return Response.json({ ok: true });
}
