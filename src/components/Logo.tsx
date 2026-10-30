import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="Aura Engine home">
      <span className="relative inline-block h-7 w-7">
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-aura via-aura-2 to-violet blur-[6px] opacity-70" />
        <span className="absolute inset-[3px] rounded-full bg-ink" />
        <span className="absolute inset-[8px] rounded-full bg-gradient-to-br from-aura to-aura-2" />
      </span>
      <span className="whitespace-nowrap font-display text-[1.45rem] leading-none">
        Aura <span className="italic text-muted">Engine</span>
      </span>
    </Link>
  );
}
