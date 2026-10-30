import * as z from "zod/v4";
import { db } from "@/lib/db";
import { claimAnonProjects, createSession, hashPassword } from "@/lib/auth";
import { grantCredits } from "@/lib/credits";
import { env } from "@/lib/env";

const Body = z.object({
  email: z.email().max(200),
  password: z.string().min(8).max(200),
  name: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a valid email and a password of at least 8 characters." }, { status: 400 });
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return Response.json({ error: "An account with this email already exists. Sign in instead." }, { status: 409 });
  const user = await db.user.create({
    data: { email, name: parsed.data.name?.trim() || null, passwordHash: await hashPassword(parsed.data.password) },
  });
  await grantCredits(user.id, env.signupCredits, "signup_bonus", `signup:${user.id}`);
  await createSession(user.id);
  await claimAnonProjects(user.id);
  return Response.json({ ok: true });
}
