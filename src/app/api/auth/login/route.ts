import * as z from "zod/v4";
import { db } from "@/lib/db";
import { claimAnonProjects, createSession, verifyPassword } from "@/lib/auth";

const Body = z.object({ email: z.string().max(200), password: z.string().max(200) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase().trim() } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return Response.json({ error: "Wrong email or password." }, { status: 401 });
  }
  await createSession(user.id);
  await claimAnonProjects(user.id);
  return Response.json({ ok: true });
}
