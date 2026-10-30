import Link from "next/link";
import { getUser } from "@/lib/auth";
import { Logo } from "./Logo";

export async function SiteNav() {
  const user = await getUser();
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-ink/75 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Logo />
        <div className="hidden items-center gap-7 text-sm text-muted md:flex">
          <Link href="/#formats" className="hover:text-cream">Formats</Link>
          <Link href="/#how" className="hover:text-cream">How it works</Link>
          <Link href="/#distribution" className="hover:text-cream">Distribution</Link>
          <Link href="/#pricing" className="hover:text-cream">Pricing</Link>
          <Link href="/studio" className="hover:text-cream">InkFrame Studio</Link>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/app" className="btn btn-ghost btn-sm">Dashboard · {user.credits} cr</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">Sign in</Link>
              <Link href="/#scan" className="btn btn-primary btn-sm">Scan your brand</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
