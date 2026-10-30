import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { AuthForm } from "@/components/AuthForm";
import { getUser } from "@/lib/auth";

export const metadata = { title: "Create account · Aura Engine" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; plan?: string }> }) {
  const { next, plan } = await searchParams;
  if (await getUser()) redirect(plan ? `/app/billing?plan=${plan}` : "/app");
  return (
    <AuthShell title="Create your account" subtitle="40 free credits: enough to lock a character and storyboard your first episode. Any scans you've run are saved to your account.">
      <AuthForm mode="signup" next={next} plan={plan} />
    </AuthShell>
  );
}
