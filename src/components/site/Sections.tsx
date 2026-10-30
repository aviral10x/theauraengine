import Link from "next/link";
import { FILMS, IF } from "@/lib/media";
import { PLANS } from "@/lib/plans";
import { ScanBox } from "@/components/ScanBox";
import { Logo } from "@/components/Logo";

export function Marquee() {
  const items = ["Micro-dramas", "Character series", "Animated brand spots", "Launch films", "Explainer skits", "Trend remixes"];
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line/70 py-6">
      <div className="marquee flex w-max gap-10 whitespace-nowrap">
        {[...row, ...row].map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-grotesk text-[clamp(1.6rem,3.6vw,3.2rem)] font-bold tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(243,237,228,0.45)]">
            {t} <span className="text-aura [-webkit-text-stroke:0]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Distribution() {
  const nodes = [
    { t: "Your accounts", d: "Captions, hashtags and AI disclosure written for every episode. Post to IG, TikTok and Shorts.", pos: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" },
    { t: "The Aura Network", d: "Placements and character cameos on Aura-owned pages with 550K+ followers.", pos: "right-0 top-1/2 translate-x-1/3 -translate-y-1/2" },
    { t: "Micro-drama pages", d: "Serialized drops across our drama page network, the playbook we run for crypto and fintech brands.", pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" },
    { t: "Clipper campaigns", d: "Vetted clippers, paid per 1,000 verified views, with fraud screening.", pos: "left-0 top-1/2 -translate-x-1/3 -translate-y-1/2" },
  ];
  return (
    <section id="distribution" className="relative overflow-hidden py-32">
      <div className="mx-auto grid max-w-[1500px] items-center gap-16 px-5 sm:px-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-3">Distribution, built in</p>
          <h2 className="mega text-[clamp(2.4rem,5.6vw,5.6rem)]">
            Making it is half the job. <span className="font-display font-normal italic tracking-tight text-aura-2">We get it watched.</span>
          </h2>
          <p className="mt-6 max-w-lg text-cream/60">
            We already run distribution for funded brands: micro-drama page networks, character pages and clipping campaigns. Aura Engine plugs your episodes straight in.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {nodes.map((n) => (
              <div key={n.t} className="border-t border-line pt-4">
                <p className="font-grotesk text-lg font-semibold">{n.t}</p>
                <p className="mt-1 text-sm text-cream/55">{n.d}</p>
              </div>
            ))}
          </div>
          <Link href="/studio?type=distribution" className="btn btn-light mt-10">Request a distribution plan →</Link>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[560px]">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,90,31,0.18),transparent_60%)]" />
          <div className="orbit absolute inset-[6%] rounded-full border border-dashed border-cream/15">
            <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-aura shadow-[0_0_20px_4px_rgba(255,90,31,0.8)]" />
          </div>
          <div className="orbit-rev absolute inset-[24%] rounded-full border border-cream/10">
            <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-violet shadow-[0_0_18px_4px_rgba(155,123,255,0.8)]" />
          </div>
          <div className="absolute inset-[6%]">
            {nodes.map((n) => (
              <span key={n.t} className={`glass absolute ${n.pos} whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm`}>{n.t}</span>
            ))}
          </div>
          <div className="absolute left-1/2 top-1/2 aspect-[9/16] w-[30%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border-2 border-aura/60 shadow-[0_0_90px_-10px_rgba(255,90,31,0.8)]">
            <video src={`${IF}/aura/night-shift-loop.mp4`} poster={`${IF}/aura/night-shift.jpg`} autoPlay muted loop playsInline preload="none" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function StudioBand() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden">
      <video className="absolute inset-0 h-full w-full object-cover" src={`${IF}/previews/the-residence.mp4`} poster={`${IF}/previews/the-residence.jpg`} autoPlay muted loop playsInline preload="none" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/70" />
      <div className="relative mx-auto flex min-h-[92vh] max-w-[1500px] flex-col justify-end px-5 pb-16 sm:px-10">
        <p className="eyebrow mb-4 !text-cream/70">InkFrame Studio</p>
        <h2 className="mega text-[clamp(3rem,10vw,10.5rem)]">
          Hand it to <span className="font-display font-normal italic tracking-tight">humans.</span>
        </h2>
        <div className="mt-8 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <p className="max-w-xl text-cream/75">
            Experiment in Aura Engine. When a concept wins, one click sends your brief, DNA, bible and storyboards to the InkFrame team for narrative films, automotive spots, property films and launch campaigns.
          </p>
          <div className="flex gap-3">
            <Link href="/studio" className="btn btn-light">Start a studio project</Link>
            <a href={IF} target="_blank" rel="noreferrer" className="btn btn-ghost !border-cream/30">See the reel ↗</a>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-3 md:grid-cols-6">
          {FILMS.map((f) => (
            <figure key={f.title} className="group overflow-hidden rounded-xl border border-cream/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.poster} alt={f.title} loading="lazy" className="aspect-video w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
              <figcaption className="bg-black/60 px-2.5 py-1.5 text-[11px]"><span className="text-cream">{f.title}</span> <span className="text-cream/50">· {f.kind}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-[1500px] px-5 py-32 sm:px-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-3">Pricing</p>
          <h2 className="mega text-[clamp(2.4rem,6vw,6rem)]">
            Start free. <span className="font-display font-normal italic tracking-tight text-aura-2">Scale to a studio.</span>
          </h2>
        </div>
        <p className="max-w-sm text-sm text-cream/55">Credits are only spent on successful generations. Failed renders are refunded automatically, and every button shows its cost.</p>
      </div>
      <div className="mt-14 grid gap-4 lg:grid-cols-4">
        <PriceCard name="Free" price="$0" blurb="See what your brand could become." features={["Brand DNA + Story DNA scan", "Format ranking + 3 series concepts", "40 credits on signup"]} href="/#top" cta="Scan your brand" />
        {PLANS.map((p, i) => (
          <PriceCard key={p.id} name={p.name} price={`$${p.priceMonthly}`} per="/mo" blurb={p.blurb} features={p.features} href={`/signup?plan=${p.id}`} cta={`Choose ${p.name}`} featured={i === 1} />
        ))}
        <PriceCard name="Series & Studio" price="$3k" per="+ / season" blurb="Done for you by InkFrame." features={["Fixed-price micro-drama or character season", "Human creative director + QA", "Distribution plan + reporting", "Cinematic films & retainers"]} href="/studio" cta="Talk to the studio" />
      </div>
    </section>
  );
}

function PriceCard({ name, price, per, blurb, features, href, cta, featured }: { name: string; price: string; per?: string; blurb: string; features: string[]; href: string; cta: string; featured?: boolean }) {
  return (
    <div className={`relative flex flex-col rounded-[1.75rem] p-7 ${featured ? "bg-cream text-ink" : "border border-line bg-ink-2"}`}>
      {featured && <span className="absolute -top-3 left-7 rounded-full bg-aura px-3 py-1 text-xs font-semibold text-ink">Most popular</span>}
      <p className="font-grotesk text-2xl font-bold">{name}</p>
      <p className={`mt-1 text-sm ${featured ? "text-ink/60" : "text-cream/55"}`}>{blurb}</p>
      <p className="mega mt-8 text-6xl">
        {price}
        {per && <span className={`ml-1 font-sans text-base font-normal tracking-normal ${featured ? "text-ink/50" : "text-cream/45"}`}>{per}</span>}
      </p>
      <ul className={`mt-8 flex-1 space-y-2.5 text-sm ${featured ? "text-ink/75" : "text-cream/65"}`}>
        {features.map((f) => (
          <li key={f} className="flex gap-2"><span className="text-aura">✦</span>{f}</li>
        ))}
      </ul>
      <Link href={href} className={`btn mt-8 ${featured ? "bg-ink text-cream hover:bg-black" : "btn-ghost"}`}>{cta}</Link>
    </div>
  );
}

const FAQ = [
  ["How is this different from Creatify, Arcads or Higgsfield's Marketing Studio?", "Those tools make one-off ads, usually AI actors reading a script. Aura Engine makes series: recurring characters, micro-drama seasons and animated worlds, in formats we've proven organically on 700M+ views. It also connects to distribution and to a real studio when you need human craft."],
  ["Which AI models do you use?", "Claude writes your strategy, series bible and shot lists. Images and video are generated through the Higgsfield API (Kling 3.0, Seedance, Grok Imagine and more), routed per shot. You never have to choose a model."],
  ["Do I own what I make?", "Yes. Paid plans include commercial rights to everything you generate. Characters you create stay yours."],
  ["Is AI content allowed on Instagram and TikTok?", "Yes, with disclosure. Aura Engine writes disclosure into every caption and avoids the riskiest pattern in the market: fake 'real customer' testimonials. We tell stories with characters instead."],
  ["Can the InkFrame team make it for us?", "Yes. Every project has a 'Send to InkFrame' button that hands our producers your brief, Brand DNA, series bible and storyboards, so the premium version starts on day one, not from a blank page."],
];

export function Faq() {
  return (
    <section className="mx-auto grid max-w-[1500px] gap-12 px-5 pb-32 sm:px-10 lg:grid-cols-[0.8fr_1.2fr]">
      <h2 className="mega text-[clamp(2.4rem,5vw,5rem)]">Questions<span className="text-aura">.</span></h2>
      <div className="divide-y divide-line border-y border-line">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-grotesk text-lg font-medium sm:text-xl">
              {q}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-aura transition group-open:rotate-45 group-open:bg-aura group-open:text-ink">+</span>
            </summary>
            <p className="mt-4 max-w-2xl text-cream/60">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function BigFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line/70">
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(50%_70%_at_50%_100%,rgba(255,90,31,0.25),transparent_70%)]" />
      <div className="relative mx-auto max-w-[1500px] px-5 pt-28 sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mega text-[clamp(2.6rem,7vw,6.5rem)]">
            What&apos;s your brand&apos;s <span className="font-display font-normal italic tracking-tight aura-text">show?</span>
          </h2>
          <p className="mb-9 mt-5 text-cream/60">Find out in about a minute. Free.</p>
          <ScanBox size="md" />
        </div>

        <div className="mt-28 grid gap-10 border-t border-line/70 pt-12 text-sm md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-cream/55">The AI video engine from InkFrame Films, the studio behind @aurakidzzz.</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-cream/60"><span className="h-1.5 w-1.5 rounded-full bg-aura" /> Winner: ai + frnds buildathon</p>
          </div>
          <div>
            <p className="eyebrow mb-3">Product</p>
            <ul className="space-y-2 text-cream/60">
              <li><Link href="/#engine" className="hover:text-cream">The engine</Link></li>
              <li><Link href="/#formats" className="hover:text-cream">Formats</Link></li>
              <li><Link href="/#pricing" className="hover:text-cream">Pricing</Link></li>
              <li><Link href="/signup" className="hover:text-cream">Create account</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3">Studio</p>
            <ul className="space-y-2 text-cream/60">
              <li><a href={IF} target="_blank" rel="noreferrer" className="hover:text-cream">InkFrame Films</a></li>
              <li><a href="https://www.instagram.com/aurakidzzz/" target="_blank" rel="noreferrer" className="hover:text-cream">@aurakidzzz</a></li>
              <li><a href={`${IF}/aurakidzzz`} target="_blank" rel="noreferrer" className="hover:text-cream">Aura case study</a></li>
              <li><Link href="/studio" className="hover:text-cream">Work with the studio</Link></li>
            </ul>
          </div>
        </div>

        <p aria-hidden className="mega pointer-events-none mt-16 select-none whitespace-nowrap text-center text-[16.5vw] leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgba(243,237,228,0.14)]">
          Aura Engine
        </p>
        <div className="flex flex-col justify-between gap-2 border-t border-line/50 py-6 text-xs text-cream/40 sm:flex-row">
          <span>© {new Date().getFullYear()} InkFrame Films</span>
          <span>AI-generated content is labeled per platform and regional rules.</span>
        </div>
      </div>
    </footer>
  );
}
