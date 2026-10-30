import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  return Response.json({ user: user ? { email: user.email, credits: user.credits, plan: user.plan } : null });
}
