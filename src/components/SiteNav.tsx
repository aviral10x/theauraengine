import Link from "next/link";
import { getUser } from "@/lib/auth";
import { Logo } from "./Logo";

/** Floating glass pill navigation. */
export async function SiteNav() {
  const user = await getUser();
  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 px-4">
      <nav className="glass pointer-events-auto mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full pl-5 pr-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
        <Logo />
        <div className="hidden items-center gap-1 text-[13px] text-cream/70 md:flex">
          {[
            ["/#reel", "Work"],
            ["/#engine", "Engine"],
            ["/#formats", "Formats"],
            ["/#distribution", "Distribution"],
            ["/#pricing", "Pricing"],
            ["/studio", "Studio"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full px-3 py-1.5 transition hover:bg-cream/10 hover:text-cream">
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {user ? (
            <Link href="/app" className="btn btn-light btn-sm">Dashboard · {user.credits} cr</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-sm hidden text-cream/80 hover:text-cream sm:inline-flex">Sign in</Link>
              <Link href="/#top" className="btn btn-light btn-sm">Scan your brand</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
