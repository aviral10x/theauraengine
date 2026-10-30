import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { LeadForm } from "@/components/LeadForm";

export const metadata = { title: "InkFrame Studio · Aura Engine" };

const IF = "https://www.inkframefilms.com";
const FILMS = [
  { t: "Alpha's Deal", k: "Narrative short", slug: "alphas-deal" },
  { t: "Aura", k: "Brand trailer", slug: "aura-trailer" },
  { t: "Ferrari", k: "Automotive concept", slug: "ferrari-concept" },
  { t: "Drools × Aura", k: "Animated brand spot", slug: "drools" },
  { t: "The Residence", k: "Property film", slug: "the-residence" },
  { t: "Theft", k: "Narrative action", slug: "theft" },
];

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const isDistribution = type === "distribution";
  return (
    <div className="min-h-screen">
      <SiteNav />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-32 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">{isDistribution ? "Distribution" : "InkFrame Studio"}</p>
          <h1 className="mega text-5xl sm:text-7xl">
            {isDistribution ? "Get your series watched." : "A film studio for brands, with an AI-first pipeline."}
          </h1>
          <p className="mt-5 text-muted">
            {isDistribution
              ? "Micro-drama page networks, Aura Network placements and vetted clipper campaigns. Tell us your goals and we'll reply with a plan and a CPM quote."
              : "Cinematic ads, character worlds, micro-drama seasons and launch films. Concept to posting-ready in days, not months. Fixed-price seasons start at $3k."}
          </p>
          <div className="card mt-8 p-6">
            <LeadForm type={isDistribution ? "distribution" : "studio"} cta={isDistribution ? "Request a distribution plan" : "Start a film"} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 self-start">
          {FILMS.map((f) => (
            <figure key={f.slug} className="overflow-hidden rounded-2xl border border-line bg-ink-2">
              <video className="aspect-video w-full object-cover" src={`${IF}/previews/${f.slug}.mp4`} poster={`${IF}/previews/${f.slug}.jpg`} autoPlay muted loop playsInline />
              <figcaption className="p-3">
                <p className="font-display text-lg">{f.t}</p>
                <p className="text-xs text-muted">{f.k}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
