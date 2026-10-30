"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { REEL } from "@/lib/media";

function CountUp({ to, suffix = "", decimals = 0, prefix = "" }: { to: number; suffix?: string; decimals?: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 2.2, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

const STATS = [
  { node: <CountUp to={700} suffix="M+" />, label: "organic views in the last 6 months" },
  { node: <CountUp to={550} suffix="K" />, label: "followers on @aurakidzzz" },
  { node: <CountUp to={75} suffix=" days" />, label: "from zero to 413K followers" },
  { node: <CountUp to={74.6} decimals={1} suffix="M" />, label: "views on a single episode" },
];

export function Reel3D() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "200px 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.4 });
  const rotate = useTransform(smooth, [0, 1], [20, -340]);
  const tilt = useTransform(smooth, [0, 0.5, 1], [-14, -6, -14]);
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => setActive(Math.min(STATS.length - 1, Math.floor(p * STATS.length * 0.999))));

  const n = REEL.length;
  const step = 360 / n;

  return (
    <section id="reel" ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_60%,rgba(155,123,255,0.12),transparent_70%)]" />
        <div className="relative z-10 mx-auto flex w-full max-w-[1500px] items-start justify-between gap-6 px-5 pt-28 sm:px-10">
          <div>
            <p className="eyebrow mb-3">The proof · our own reel</p>
            <h2 className="mega max-w-3xl text-[clamp(2.4rem,6vw,6rem)]">
              We went viral <span className="font-display font-normal italic tracking-tight text-aura-2">first.</span>
            </h2>
          </div>
          <p className="hidden max-w-xs pt-10 text-sm text-cream/60 md:block">
            Aura is an original character our team grew with an AI-first pipeline, posting multiple episodes a day. Aura Engine is that pipeline, productized.
          </p>
        </div>

        {/* 3D cylinder */}
        <div className="relative flex flex-1 items-center justify-center [perspective:1600px]">
          <div className="relative h-[min(44vh,410px)] w-[min(24.75vh,230px)] [transform-style:preserve-3d]" style={{ transform: "translateZ(calc(min(24.75vh,230px) * -1.62))" }}>
          <motion.div style={{ rotateY: rotate, rotateX: tilt }} className="absolute inset-0 [transform-style:preserve-3d]">
            {REEL.map((c, i) => (
              <div
                key={c.title + i}
                className="absolute inset-0 overflow-hidden rounded-2xl border border-cream/10 bg-ink-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] [backface-visibility:hidden]"
                style={{ transform: `rotateY(${i * step}deg) translateZ(calc(min(24.75vh,230px) * 1.62))` }}
              >
                {inView ? (
                  <video className="h-full w-full object-cover" src={c.video} poster={c.poster} autoPlay muted loop playsInline preload="none" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="h-full w-full object-cover" src={c.poster} alt="" loading="lazy" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3.5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-cream/60">{c.kind}</p>
                  <p className="font-grotesk text-base font-semibold leading-tight">{c.title}</p>
                </div>
              </div>
            ))}
          </motion.div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 mx-auto grid w-full max-w-[1500px] grid-cols-2 gap-px px-5 pb-10 sm:px-10 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} className={`border-t pt-4 transition-colors duration-500 ${i <= active ? "border-aura" : "border-line"}`}>
              <p className={`mega text-[clamp(2rem,4.4vw,4.4rem)] transition-colors duration-500 ${i <= active ? "text-cream" : "text-cream/25"}`}>{s.node}</p>
              <p className="mt-1 text-xs text-cream/50 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
