import Link from "next/link";
import { db, parseJson } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ScanBox } from "@/components/ScanBox";
import { getFormat } from "@/lib/formats";
import type { BrandScan } from "@/lib/schemas";
import type { CrawlResult } from "@/lib/crawl";

export const metadata = { title: "Projects · Aura Engine" };

export default async function Dashboard() {
  const user = await requireUser("/app");
  const projects = await db.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { episodes: { select: { finalUrl: true } } },
    take: 60,
  });

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
        <div>
          <p className="eyebrow mb-2">Projects</p>
          <h1 className="font-display text-5xl">What are we making next?</h1>
          <p className="mt-2 text-muted">Paste a brand URL to start a new series.</p>
        </div>
        <ScanBox size="md" />
      </div>

      {projects.length === 0 ? (
        <div className="card mt-12 p-10 text-center text-muted">No projects yet. Scan your first brand above.</div>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const scan = parseJson<BrandScan | null>(p.dna, null);
            const crawl = parseJson<Partial<CrawlResult>>(p.crawl, {});
            const done = p.episodes.filter((e) => e.finalUrl).length;
            return (
              <Link key={p.id} href={`/p/${p.id}`} className="card group overflow-hidden transition hover:border-aura/50">
                <div className="relative h-36 overflow-hidden bg-ink-3">
                  {crawl.ogImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={crawl.ogImage} alt="" className="h-full w-full object-cover opacity-70 transition group-hover:scale-105" />
                  ) : (
                    <div className="aura-glow h-full w-full" />
                  )}
                  <span className="chip absolute left-3 top-3 bg-ink/80 !text-cream">{p.status}</span>
                </div>
                <div className="p-5">
                  <p className="font-display text-2xl">{p.name ?? p.domain}</p>
                  <p className="text-xs text-muted">{p.domain}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-cream/80">{scan?.brand.oneLiner}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.formatId && <span className="chip">{getFormat(p.formatId).name}</span>}
                    <span className="chip">{p.episodes.length} episodes</span>
                    {done > 0 && <span className="chip !text-ok">{done} finished</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
