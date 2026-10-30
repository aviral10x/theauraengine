import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { AuthForm } from "@/components/AuthForm";
import { getUser } from "@/lib/auth";

export const metadata = { title: "Sign in · Aura Engine" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; plan?: string }> }) {
  const { next, plan } = await searchParams;
  if (await getUser()) redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/app");
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to keep building your series.">
      <AuthForm mode="login" next={next} plan={plan} />
    </AuthShell>
  );
}
