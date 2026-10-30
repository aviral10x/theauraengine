"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { FORMATS } from "@/lib/formats";

/** Vertical scroll → horizontal film-strip of formats. */
export function FormatsRail() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.3 });
  const x = useTransform(smooth, [0, 1], ["0%", `-${((FORMATS.length - 1) / (FORMATS.length + 0.6)) * 100}%`]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="formats" ref={ref} className="relative" style={{ height: `${FORMATS.length * 55 + 60}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-8 flex w-full max-w-[1500px] items-end justify-between gap-6 px-5 sm:px-10">
          <div>
            <p className="eyebrow mb-3">The Aura format library</p>
            <h2 className="mega text-[clamp(2.4rem,6vw,6rem)]">
              Six formats. <span className="font-display font-normal italic tracking-tight text-aura-2">All proven.</span>
            </h2>
          </div>
          <div className="hidden w-48 md:block">
            <p className="eyebrow mb-2 text-right">Scroll</p>
            <div className="h-px bg-line"><motion.div style={{ width: bar }} className="h-px bg-aura" /></div>
          </div>
        </div>

        <motion.div style={{ x }} className="flex gap-5 pl-5 sm:pl-10">
          {FORMATS.map((f, i) => (
            <article key={f.id} className="group relative flex h-[62vh] w-[min(78vw,560px)] shrink-0 flex-col overflow-hidden rounded-[1.75rem] border border-line bg-ink-2">
              <div className="relative h-[58%] overflow-hidden">
                {f.preview ? (
                  <video className="h-full w-full object-cover transition duration-[1.2s] group-hover:scale-105" src={f.preview.video} poster={f.preview.poster} autoPlay muted loop playsInline preload="none" />
                ) : (
                  <div className="relative h-full w-full overflow-hidden bg-ink-3">
                    <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_30%,rgba(255,90,31,0.35),transparent_70%),radial-gradient(50%_50%_at_80%_70%,rgba(155,123,255,0.35),transparent_70%)]" />
                    <span className="mega absolute bottom-4 left-5 text-[5rem] text-cream/10">{f.name.split(" ")[0]}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-transparent to-transparent" />
                <span className="absolute left-5 top-5 font-mono text-xs text-cream/70">{String(i + 1).padStart(2, "0")} / {String(FORMATS.length).padStart(2, "0")}</span>
                <span className="chip absolute right-5 top-5 bg-black/50 !text-cream">{f.aspect} · {f.episodeSeconds[0]}–{f.episodeSeconds[1]}s</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-grotesk text-3xl font-bold tracking-tight">{f.name}</h3>
                <p className="mt-1 text-aura-2">{f.tagline}</p>
                <p className="mt-3 line-clamp-3 text-sm text-cream/60">{f.description}</p>
                <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
                  {f.bestFor.slice(0, 3).map((b) => <span key={b} className="chip">{b}</span>)}
                  {f.proof && (
                    <a href={f.proof.href} target="_blank" rel="noreferrer" className="ml-auto text-xs text-cream/70 underline decoration-aura/60 underline-offset-4 hover:text-cream">
                      Proof ↗
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
          <div className="flex w-[30vw] shrink-0 items-center">
            <p className="font-display text-4xl italic text-cream/60">Your scan ranks them for your brand, and explains why.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
