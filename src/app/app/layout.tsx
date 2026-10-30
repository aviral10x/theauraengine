import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login?next=/app");
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-8">
            <Logo href="/app" />
            <nav className="hidden gap-6 text-sm text-muted sm:flex">
              <Link href="/app" className="hover:text-cream">Projects</Link>
              <Link href="/app/billing" className="hover:text-cream">Billing</Link>
              <Link href="/studio" className="hover:text-cream">Studio</Link>
              {user.isAdmin && <Link href="/app/admin" className="hover:text-cream">Admin</Link>}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/app/billing" className="chip !text-cream">{user.credits} credits · {user.plan}</Link>
            <span className="hidden text-muted md:inline">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10">{children}</main>
    </div>
  );
}
