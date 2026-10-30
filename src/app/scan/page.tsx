import { SiteNav } from "@/components/SiteNav";
import { ScanBox } from "@/components/ScanBox";

export const metadata = { title: "Scan your brand · Aura Engine" };

/** Shareable entry point: /scan?url=brand.com starts a scan immediately. */
export default async function ScanPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const { url } = await searchParams;
  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="relative">
        <div className="aura-glow absolute inset-0" />
        <div className="relative mx-auto max-w-2xl px-5 pb-24 pt-40 text-center">
          <h1 className="mega text-6xl sm:text-7xl">Scan your brand</h1>
          <p className="mb-10 mt-4 text-muted">We&apos;ll read your site and come back with Brand DNA, Story DNA and three series concepts.</p>
          <ScanBox initialUrl={url ?? ""} autoStart={Boolean(url)} />
        </div>
      </div>
    </div>
  );
}
