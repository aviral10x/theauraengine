import * as z from "zod/v4";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";

const Body = z.object({
  type: z.enum(["studio", "distribution", "contact"]),
  name: z.string().min(1).max(120),
  email: z.email().max(200),
  company: z.string().max(160).optional(),
  url: z.string().max(400).optional(),
  budget: z.string().max(80).optional(),
  message: z.string().max(4000).optional(),
  projectId: z.string().max(40).optional(),
});

/** Studio (InkFrame) handoffs, distribution requests and general contact. Optionally forwarded to a Slack/Zapier webhook. */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please fill in your name and a valid email." }, { status: 400 });
  const user = await getUser();
  const lead = await db.lead.create({ data: { ...parsed.data, userId: user?.id ?? null } });

  const hook = process.env.LEADS_WEBHOOK_URL;
  if (hook) {
    fetch(hook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: `New ${lead.type} lead: ${lead.name} <${lead.email}> ${lead.company ?? ""} ${lead.url ?? ""}\n${lead.message ?? ""}` }),
    }).catch(() => undefined);
  }
  return Response.json({ ok: true });
}
