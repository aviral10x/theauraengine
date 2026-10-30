import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { ScanBox } from "@/components/ScanBox";
import { Footer } from "@/components/Footer";
import { FORMATS } from "@/lib/formats";
import { PLANS } from "@/lib/plans";

const IF = "https://www.inkframefilms.com";

const STATS = [
  { value: "700M+", label: "organic views in 6 months" },
  { value: "550K", label: "followers on @aurakidzzz" },
  { value: "75 days", label: "from 0 to 413K followers" },
  { value: "74.6M", label: "views on a single episode" },
];

const EPISODES = [
  { title: "The Frozen Spoon", line: "Science said no. Aura licked it anyway.", slug: "frozen-spoon" },
  { title: "The Night Shift", line: "Everyone in the house is asleep. Aura has other plans.", slug: "night-shift" },
  { title: "The Lemon", line: "First lemon. Full commitment. Instant regret.", slug: "the-lemon" },
  { title: "The Picnic", line: "Grass, pigeons, and a dalmatian who takes crumbs personally.", slug: "the-picnic" },
];

const STEPS = [
  { n: "01", t: "Scan", d: "Paste your URL. We crawl your site: products, copy, visuals, voice, proof." },
  { n: "02", t: "Brand + Story DNA", d: "Not just your colors and fonts. The tensions, desires, villains and worlds your audience lives in." },
  { n: "03", t: "Pick a format", d: "Ranked formats with the reasoning, each one proven on our own pages." },
  { n: "04", t: "Write the season", d: "A series bible, recurring characters and episode arcs, written by our creative-director AI." },
  { n: "05", t: "Lock characters", d: "Character sheets keep faces, outfits and products identical across every episode." },
  { n: "06", t: "Storyboard", d: "Approve every frame before a single video credit is spent." },
  { n: "07", t: "Render", d: "Each shot is animated from its approved frame with native sound, then stitched into episodes." },
  { n: "08", t: "Distribute", d: "Post to your accounts, boost on the Aura Network, or seed with clippers. Every post is labeled." },
];

const FAQ = [
  {
    q: "How is this different from Creatify, Arcads or Higgsfield's Marketing Studio?",
    a: "Those tools make one-off ads, usually AI actors reading a script. Aura Engine makes series: recurring characters, micro-drama seasons and animated worlds, in formats we've proven organically on 700M+ views. It also connects to distribution and to a real studio when you need human craft.",
  },
  {
    q: "Which AI models do you use?",
    a: "Claude writes your strategy, series bible and shot lists. Images and video are generated through the Higgsfield API (Kling 3.0, Seedance, Grok Imagine and more), routed per shot. You never have to choose a model.",
  },
  {
    q: "Do I own what I make?",
    a: "Yes. Paid plans include commercial rights to everything you generate. Characters you create stay yours.",
  },
  {
    q: "Is AI content allowed on Instagram and TikTok?",
    a: "Yes, with disclosure. Aura Engine writes disclosure into every caption and avoids the riskiest pattern in the market: fake 'real customer' testimonials. We tell stories with characters instead.",
  },
  {
    q: "Can the InkFrame team make it for us?",
    a: "Yes. Every project has a 'Send to InkFrame' button that hands our producers your brief, Brand DNA, series bible and storyboards, so the premium version starts from day one, not from a blank page.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* HERO */}
      <section id="scan" className="relative overflow-hidden grain">
        <div className="aura-glow absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:pt-24">
          <div>
            <p className="eyebrow mb-6">By InkFrame Films · the studio behind @aurakidzzz</p>
            <h1 className="font-display text-5xl leading-[0.95] sm:text-7xl lg:text-[5.6rem]">
              Paste your URL.
              <br />
              Get a <span className="aura-text italic">series</span>, not an ad.
            </h1>
            <p className="mt-7 max-w-xl text-lg text-muted">
              Aura Engine turns your website into micro-dramas, character series and launch films, built on the exact formats behind{" "}
              <span className="text-cream">700M+ organic views</span>.
            </p>
            <div className="mt-9 max-w-2xl">
              <ScanBox />
              <p className="mt-3 text-xs text-muted">Free Brand DNA + Story DNA + 3 series concepts. No card, no signup to scan.</p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-aura/30 via-aura-2/10 to-violet/30 blur-3xl" />
            <div className="relative aspect-[9/16] overflow-hidden rounded-[2rem] border border-line bg-ink-2 shadow-2xl">
              <video className="h-full w-full object-cover" src={`${IF}/aura/frozen-spoon-loop.mp4`} poster={`${IF}/aura/frozen-spoon.jpg`} autoPlay muted loop playsInline />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5">
                <p className="eyebrow !text-cream/70">@aurakidzzz · Episode</p>
                <p className="font-display text-2xl">The Frozen Spoon</p>
                <p className="text-sm text-cream/70">Made with the Character Chaos format</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative border-y border-line/60 bg-ink/60">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-line/60 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="px-5 py-7 text-center">
                <p className="font-display text-4xl sm:text-5xl aura-text">{s.value}</p>
                <p className="mt-1 text-xs text-muted sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">The proof</p>
            <h2 className="font-display text-4xl sm:text-6xl">We didn&apos;t build a tool and hope. We went viral first.</h2>
            <p className="mt-5 text-muted">
              Aura is an original character our team created and grew to 550K followers and 700M+ views with an AI-first pipeline, posting
              multiple episodes a day. Aura Engine is that pipeline, productized for your brand.
            </p>
          </div>
          <a href={`${IF}/aurakidzzz`} target="_blank" rel="noreferrer" className="btn btn-ghost">Read the case study ↗</a>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {EPISODES.map((e) => (
            <figure key={e.slug} className="group overflow-hidden rounded-2xl border border-line bg-ink-2">
              <div className="aspect-[9/14] overflow-hidden">
                <video className="h-full w-full object-cover transition duration-700 group-hover:scale-105" src={`${IF}/aura/${e.slug}-loop.mp4`} poster={`${IF}/aura/${e.slug}.jpg`} autoPlay muted loop playsInline />
              </div>
              <figcaption className="p-4">
                <p className="font-display text-xl">{e.title}</p>
                <p className="mt-1 text-xs text-muted">{e.line}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CONTRAST */}
      <section className="border-y border-line/60 bg-ink-2/50">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-2">
          <div>
            <p className="eyebrow mb-4">Why series</p>
            <h2 className="font-display text-4xl sm:text-5xl">Ads are a commodity now. Stories compound.</h2>
            <p className="mt-5 text-muted">
              Every platform will generate a UGC ad from your URL for free. That&apos;s the floor, not the edge. What people follow, binge and share
              is characters and cliffhangers. A season builds an audience you own. A single ad is forgotten by Friday.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            {[
              ["One-off UGC ad", "Recurring characters people follow"],
              ["AI actor pretending to be a customer", "Fiction with disclosure, so you stay compliant"],
              ["Optimized for a 3-day ad flight", "Episodes that keep compounding organically"],
              ["Tool only, you're on your own", "Engine + distribution + a real studio"],
            ].map(([a, b]) => (
              <div key={a} className="grid grid-cols-2 overflow-hidden rounded-xl border border-line">
                <div className="bg-ink p-4 text-muted line-through decoration-muted/40">{a}</div>
                <div className="bg-ink-3 p-4 text-cream">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMATS */}
      <section id="formats" className="mx-auto max-w-7xl px-5 py-24">
        <p className="eyebrow mb-4">The Aura format library</p>
        <h2 className="max-w-3xl font-display text-4xl sm:text-6xl">Six formats we&apos;ve actually made work.</h2>
        <p className="mt-5 max-w-2xl text-muted">Each format is a playbook: structure, pacing, shot grammar and rules. Your scan ranks them for your brand and explains why.</p>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FORMATS.map((f) => (
            <article key={f.id} className="card flex flex-col overflow-hidden">
              <div className="relative aspect-video overflow-hidden bg-ink-3">
                {f.preview ? (
                  <video className="h-full w-full object-cover" src={f.preview.video} poster={f.preview.poster} autoPlay muted loop playsInline />
                ) : (
                  <div className="aura-glow flex h-full items-center justify-center">
                    <span className="font-display text-3xl italic text-cream/80">{f.name}</span>
                  </div>
                )}
                <span className="chip absolute left-3 top-3 bg-ink/80 !text-cream">{f.aspect} · {f.episodeSeconds[0]}–{f.episodeSeconds[1]}s</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-2xl">{f.name}</h3>
                <p className="mt-1 text-sm text-aura-2">{f.tagline}</p>
                <p className="mt-3 flex-1 text-sm text-muted">{f.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {f.bestFor.slice(0, 3).map((b) => (
                    <span key={b} className="chip">{b}</span>
                  ))}
                </div>
                {f.proof && (
                  <a href={f.proof.href} target="_blank" rel="noreferrer" className="mt-4 text-xs text-cream/80 underline decoration-aura/60 underline-offset-4">
                    Proof: {f.proof.label} ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="border-y border-line/60 bg-ink-2/50">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <p className="eyebrow mb-4">How it works</p>
          <h2 className="max-w-3xl font-display text-4xl sm:text-6xl">From URL to a finished season.</h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-ink p-6">
                <p className="font-mono text-xs text-aura">{s.n}</p>
                <p className="mt-3 font-display text-2xl">{s.t}</p>
                <p className="mt-2 text-sm text-muted">{s.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            Powered by Claude for strategy and writing, and the Higgsfield API (Kling 3.0, Seedance, Grok Imagine) for images and video.
          </p>
        </div>
      </section>

      {/* DISTRIBUTION */}
      <section id="distribution" className="mx-auto max-w-7xl px-5 py-24">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4">Distribution, built in</p>
            <h2 className="font-display text-4xl sm:text-6xl">Making it is half the job. We also get it watched.</h2>
            <p className="mt-5 text-muted">
              We already run distribution for funded brands: micro-drama page networks, character pages and clipping campaigns. Aura Engine
              plugs your episodes straight into it.
            </p>
            <Link href="/studio?type=distribution" className="btn btn-primary mt-8">Request distribution</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Your accounts", "Captions, hashtags and AI disclosure written for every episode. Post natively to IG, TikTok and Shorts."],
              ["The Aura Network", "Placements and character cameos on Aura-owned pages with 550K+ followers."],
              ["Micro-drama page network", "Serialized drops across our drama pages, the playbook we run for crypto and fintech brands."],
              ["Clipper campaigns", "Seed episodes through vetted clippers on a pay-per-1,000-views basis with fraud screening."],
            ].map(([t, d]) => (
              <div key={t} className="card p-6">
                <p className="font-display text-2xl">{t}</p>
                <p className="mt-2 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STUDIO */}
      <section className="relative overflow-hidden border-y border-line/60">
        <video className="absolute inset-0 h-full w-full object-cover opacity-35" src={`${IF}/previews/the-residence.mp4`} poster={`${IF}/previews/the-residence.jpg`} autoPlay muted loop playsInline />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="relative mx-auto max-w-7xl px-5 py-28">
          <p className="eyebrow mb-4">InkFrame Studio</p>
          <h2 className="max-w-2xl font-display text-4xl sm:text-6xl">When it needs to be cinematic, hand it to humans.</h2>
          <p className="mt-5 max-w-xl text-muted">
            Experiment in Aura Engine. When a concept wins, one click sends your brief, DNA, bible and storyboards to the InkFrame team for
            narrative films, automotive spots, property films and launch campaigns.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/studio" className="btn btn-primary">Start a studio project</Link>
            <a href={IF} target="_blank" rel="noreferrer" className="btn btn-ghost">See the reel ↗</a>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-7xl px-5 py-24">
        <p className="eyebrow mb-4">Pricing</p>
        <h2 className="font-display text-4xl sm:text-6xl">Start free. Scale to a studio.</h2>
        <p className="mt-4 max-w-2xl text-muted">Credits are spent only on successful generations. Failed renders are refunded automatically. You see the cost before every render.</p>
        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          <div className="card flex flex-col p-7">
            <p className="font-display text-3xl">Free</p>
            <p className="mt-1 text-sm text-muted">See what your brand could become.</p>
            <p className="mt-6 font-display text-5xl">$0</p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-muted">
              <li>✓ Brand DNA + Story DNA scan</li>
              <li>✓ Format ranking + 3 series concepts</li>
              <li>✓ 40 credits on signup</li>
            </ul>
            <Link href="/#scan" className="btn btn-ghost mt-8">Scan your brand</Link>
          </div>
          {PLANS.map((p, i) => (
            <div key={p.id} className={`card relative flex flex-col p-7 ${i === 1 ? "border-aura/60 shadow-[0_0_60px_-25px_rgba(255,122,69,0.7)]" : ""}`}>
              {i === 1 && <span className="chip absolute -top-3 left-7 bg-aura !text-ink !border-aura">Most popular</span>}
              <p className="font-display text-3xl">{p.name}</p>
              <p className="mt-1 text-sm text-muted">{p.blurb}</p>
              <p className="mt-6 font-display text-5xl">
                ${p.priceMonthly}
                <span className="text-lg text-muted">/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-muted">
                {p.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <Link href={`/signup?plan=${p.id}`} className={`btn mt-8 ${i === 1 ? "btn-primary" : "btn-ghost"}`}>Choose {p.name}</Link>
            </div>
          ))}
          <div className="card flex flex-col p-7">
            <p className="font-display text-3xl">Series &amp; Studio</p>
            <p className="mt-1 text-sm text-muted">Done for you by InkFrame.</p>
            <p className="mt-6 font-display text-5xl">
              $3k<span className="text-lg text-muted">+ /season</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-muted">
              <li>✓ Fixed-price micro-drama or character season</li>
              <li>✓ Human creative director + QA</li>
              <li>✓ Distribution plan + reporting</li>
              <li>✓ Cinematic films &amp; retainers</li>
            </ul>
            <Link href="/studio" className="btn btn-ghost mt-8">Talk to the studio</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line/60 bg-ink-2/50">
        <div className="mx-auto max-w-4xl px-5 py-24">
          <h2 className="font-display text-4xl sm:text-5xl">Questions</h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg">
                  {f.q}
                  <span className="text-aura transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="aura-glow absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-5 py-28 text-center">
          <h2 className="font-display text-5xl sm:text-7xl">
            What&apos;s your brand&apos;s <span className="aura-text italic">show</span>?
          </h2>
          <p className="mt-5 text-muted">Find out in about a minute. Free.</p>
          <div className="mx-auto mt-9 max-w-2xl">
            <ScanBox size="md" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
