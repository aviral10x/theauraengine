"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { AURA_EPISODES, FILMS } from "@/lib/media";

const STEPS = [
  { t: "Scan", d: "Paste a URL. We crawl products, copy, visuals, voice and proof points." },
  { t: "Brand + Story DNA", d: "Not just colors and fonts: the tensions, desires, villains and worlds your audience lives in." },
  { t: "Pick a format", d: "Every format ranked for your brand, with the reasoning, from a library we proved on our own pages." },
  { t: "Write the season", d: "A series bible, recurring characters and episode arcs from our creative-director AI." },
  { t: "Storyboard", d: "Character sheets lock faces and outfits. Approve every frame before a video credit is spent." },
  { t: "Render", d: "Each frame becomes a shot with native sound, then everything is stitched into a finished episode." },
  { t: "Distribute", d: "Your accounts, the Aura Network, micro-drama pages and clippers. Every post is labeled." },
];

const ease = [0.16, 1, 0.3, 1] as const;
const enter = { initial: { opacity: 0, y: 30, filter: "blur(8px)" }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, exit: { opacity: 0, y: -30, filter: "blur(8px)" }, transition: { duration: 0.6, ease } };

function Panel({ step }: { step: number }) {
  switch (step) {
    case 0:
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-cream/20" /><span className="h-2.5 w-2.5 rounded-full bg-cream/20" /><span className="h-2.5 w-2.5 rounded-full bg-cream/20" />
            <div className="ml-3 flex-1 rounded-full bg-ink px-4 py-1.5 font-mono text-xs text-cream/80">
              https://yourbrand.com<span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-aura align-middle" />
            </div>
          </div>
          <div className="relative flex-1 overflow-hidden p-6">
            <div className="grid grid-cols-3 gap-4 opacity-60">
              <div className="col-span-3 h-28 rounded-xl bg-gradient-to-r from-aura/30 to-violet/20" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square rounded-lg bg-ink-3" />
                  <div className="h-2 w-3/4 rounded bg-ink-3" />
                  <div className="h-2 w-1/2 rounded bg-ink-3" />
                </div>
              ))}
            </div>
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-aura/0 via-aura/30 to-aura/0" style={{ animation: "scan 2.4s linear infinite" }} />
            {[["Products", "12 found", "left-6 top-36"], ["Palette", "5 colors", "right-6 top-48"], ["Voice", "warm · playful", "left-10 bottom-10"]].map(([k, v, pos], i) => (
              <motion.div key={k} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.35 }} className={`glass absolute ${pos} rounded-full px-3 py-1.5 text-xs`}>
                <span className="text-aura-2">{k}</span> · {v}
              </motion.div>
            ))}
          </div>
        </div>
      );
    case 1:
      return (
        <div className="grid h-full grid-cols-2 gap-3 p-5">
          <div className="col-span-2 rounded-2xl bg-ink p-4">
            <p className="eyebrow mb-2">Brand DNA · example pet-food brand</p>
            <p className="font-grotesk text-xl font-semibold leading-snug">Real food for dogs, made by people who treat them like family.</p>
            <div className="mt-3 flex gap-2">{["#e4002b", "#ffd200", "#1a1a1a", "#f6efe2"].map((c, i) => <motion.span key={c} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + i * 0.08 }} className="h-7 w-7 rounded-full border border-cream/20" style={{ background: c }} />)}</div>
          </div>
          {[["Tensions", ["Picky eaters at 7am", "Guilt about kibble"]], ["Desires", ["A dog that's genuinely happy", "Feeling like a good parent"]], ["Villains", ["The sad bowl", "Mealtime chaos"]], ["Worlds", ["A sleepy kitchen", "The park at golden hour"]]].map(([k, items], i) => (
            <motion.div key={k as string} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.12 }} className="rounded-2xl bg-ink p-4">
              <p className="eyebrow mb-2">{k as string}</p>
              {(items as string[]).map((x) => <p key={x} className="text-sm text-cream/85">· {x}</p>)}
            </motion.div>
          ))}
        </div>
      );
    case 2:
      return (
        <div className="flex h-full flex-col justify-center gap-3 p-6">
          <p className="eyebrow mb-1">Format fit · example scan</p>
          {[["Character Chaos", 94], ["Animated Brand Spot", 88], ["Micro-Drama Season", 71], ["Trend Remix", 64], ["Explainer Skit", 42], ["Cinematic Launch Film", 38]].map(([f, s], i) => (
            <div key={f as string}>
              <div className="mb-1 flex justify-between text-sm"><span>{f}</span><span className="font-mono text-aura-2">{s}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-ink">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-aura to-aura-2" initial={{ width: 0 }} animate={{ width: `${s}%` }} transition={{ delay: 0.15 + i * 0.1, duration: 1, ease }} />
              </div>
            </div>
          ))}
        </div>
      );
    case 3:
      return (
        <div className="grid h-full grid-cols-[0.8fr_1.2fr] gap-4 p-5">
          <div className="relative overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={AURA_EPISODES[0].poster} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
              <p className="eyebrow !text-cream/60">Lead character</p>
              <p className="font-grotesk text-lg font-semibold">Aura</p>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="eyebrow">Season 1 · Character Chaos</p>
            <p className="font-grotesk mt-1 text-2xl font-bold leading-tight">Small Chaos</p>
            <p className="mt-1 text-sm text-cream/60">One sneeze of destiny. One very hungry pup. Breakfast is serious business.</p>
            <div className="mt-4 space-y-2">
              {["The Frozen Spoon", "The Night Shift", "The Lemon", "The Picnic", "The Big Bowl"].map((e, i) => (
                <motion.div key={e} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex items-center gap-3 rounded-xl bg-ink px-3 py-2 text-sm">
                  <span className="font-mono text-xs text-aura">E{i + 1}</span>{e}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      );
    case 4:
      return (
        <div className="grid h-full grid-cols-3 gap-3 p-5">
          {[...AURA_EPISODES, FILMS[1], FILMS[0]].map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.poster} alt="" className="h-full w-full object-cover" />
              <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px]">#{i + 1}</span>
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.12, type: "spring" }} className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-ok text-xs text-ink">✓</motion.span>
            </motion.div>
          ))}
        </div>
      );
    case 5:
      return (
        <div className="flex h-full items-center justify-center gap-6 p-6">
          <div className="relative aspect-[9/16] h-[88%] overflow-hidden rounded-[1.6rem] border-4 border-ink-3 shadow-2xl">
            <video src={AURA_EPISODES[0].video} poster={AURA_EPISODES[0].poster} autoPlay muted loop playsInline className="h-full w-full object-cover" />
            <div className="absolute inset-x-3 bottom-3">
              <div className="h-1 overflow-hidden rounded-full bg-white/20"><motion.div className="h-full bg-aura" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} /></div>
            </div>
          </div>
          <div className="hidden space-y-2 text-sm sm:block">
            {[["Model", "Kling 3.0"], ["Audio", "Native"], ["Length", "15s · 9:16"], ["Shots", "3 · stitched"], ["Label", "AI disclosure ✓"]].map(([k, v]) => (
              <div key={k} className="glass rounded-xl px-3 py-2"><span className="text-cream/50">{k}</span> <span className="ml-2">{v}</span></div>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className="relative flex h-full items-center justify-center">
          <div className="orbit absolute h-[78%] w-[78%] rounded-full border border-dashed border-cream/15" />
          <div className="orbit-rev absolute h-[52%] w-[52%] rounded-full border border-cream/10" />
          {[["Your IG + TikTok", "top-[8%] left-1/2 -translate-x-1/2"], ["Aura Network · 550K", "right-[4%] top-1/2 -translate-y-1/2"], ["Micro-drama pages", "bottom-[8%] left-1/2 -translate-x-1/2"], ["Clippers · CPM", "left-[4%] top-1/2 -translate-y-1/2"]].map(([l, pos], i) => (
            <motion.div key={l} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.12 }} className={`glass absolute ${pos} rounded-full px-3 py-1.5 text-xs sm:text-sm`}>{l}</motion.div>
          ))}
          <div className="relative aspect-[9/16] h-[42%] overflow-hidden rounded-2xl border-2 border-aura/60 shadow-[0_0_80px_-10px_rgba(255,90,31,0.7)]">
            <video src={AURA_EPISODES[1].video} poster={AURA_EPISODES[1].poster} autoPlay muted loop playsInline className="h-full w-full object-cover" />
          </div>
        </div>
      );
  }
}

export function Pipeline() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => setStep(Math.min(STEPS.length - 1, Math.max(0, Math.floor(p * STEPS.length)))));

  return (
    <section id="engine" ref={ref} className="relative" style={{ height: `${STEPS.length * 70 + 30}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1500px] items-center gap-10 px-5 pt-16 sm:px-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow mb-3">The engine</p>
            <h2 className="mega text-[clamp(2.4rem,5vw,5rem)]">
              From URL to a <span className="font-display font-normal italic tracking-tight text-aura-2">finished season.</span>
            </h2>
            <ol className="mt-8 space-y-1">
              {STEPS.map((s, i) => (
                <li key={s.t} className={`rounded-2xl px-4 py-3 transition-all duration-500 ${i === step ? "bg-ink-2" : ""}`}>
                  <div className="flex items-baseline gap-4">
                    <span className={`font-mono text-xs transition-colors ${i === step ? "text-aura" : "text-cream/30"}`}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={`font-grotesk text-xl font-semibold transition-colors sm:text-2xl ${i === step ? "text-cream" : i < step ? "text-cream/45" : "text-cream/25"}`}>{s.t}</span>
                  </div>
                  <motion.p initial={false} animate={{ height: i === step ? "auto" : 0, opacity: i === step ? 1 : 0 }} className="overflow-hidden pl-9 text-sm text-cream/60">
                    <span className="block pt-1">{s.d}</span>
                  </motion.p>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative hidden aspect-[1.05] w-full lg:block">
            <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(255,90,31,0.18),transparent_65%)] blur-2xl" />
            <div className="glass relative h-full overflow-hidden rounded-[2rem]">
              <div className="flex items-center justify-between border-b border-line/70 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/40">
                <span>Aura Engine · step {String(step + 1).padStart(2, "0")}/07</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok" /> live</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 top-10">
                <AnimatePresence mode="wait">
                  <motion.div key={step} {...enter} className="h-full">
                    <Panel step={step} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
