import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted">
            The AI video engine from InkFrame Films, the studio behind @aurakidzzz. Built on formats proven on 700M+ organic views.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-aura" /> Winner: ai + frnds buildathon
          </p>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3">Product</p>
          <ul className="space-y-2 text-muted">
            <li><Link href="/#formats" className="hover:text-cream">Formats</Link></li>
            <li><Link href="/#pricing" className="hover:text-cream">Pricing</Link></li>
            <li><Link href="/#distribution" className="hover:text-cream">Distribution</Link></li>
            <li><Link href="/signup" className="hover:text-cream">Create account</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3">Studio</p>
          <ul className="space-y-2 text-muted">
            <li><a href="https://www.inkframefilms.com" target="_blank" rel="noreferrer" className="hover:text-cream">InkFrame Films</a></li>
            <li><a href="https://www.instagram.com/aurakidzzz/" target="_blank" rel="noreferrer" className="hover:text-cream">@aurakidzzz</a></li>
            <li><a href="https://www.inkframefilms.com/aurakidzzz" target="_blank" rel="noreferrer" className="hover:text-cream">Aura case study</a></li>
            <li><Link href="/studio" className="hover:text-cream">Work with the studio</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/50 py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} InkFrame Films · AI-generated content is labeled per platform and regional rules.
      </div>
    </footer>
  );
}
