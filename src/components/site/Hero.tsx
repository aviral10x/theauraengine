"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "motion/react";
import { ScanBox } from "@/components/ScanBox";

const AuraOrb = dynamic(() => import("./AuraOrb").then((m) => m.AuraOrb), { ssr: false });

const ease = [0.16, 1, 0.3, 1] as const;

function Line({ children, delay, className = "" }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <span className={`block overflow-hidden pb-[0.08em] ${className}`}>
      <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay, ease }}>
        {children}
      </motion.span>
    </span>
  );
}

function Timecode() {
  const [t, setT] = useState("00:00:00:00");
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const loop = () => {
      const ms = performance.now() - start;
      const f = Math.floor((ms / 1000) * 24) % 24;
      const s = Math.floor(ms / 1000);
      const p = (n: number) => String(n).padStart(2, "0");
      setT(`${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(f)}`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <span className="tabular-nums">{t}</span>;
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 1.6]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const fade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section id="top" ref={ref} className="grain relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,rgba(255,90,31,0.16),transparent_70%),radial-gradient(40%_40%_at_80%_20%,rgba(155,123,255,0.14),transparent_70%)]" />
      <motion.div style={{ scale: orbScale, opacity: orbOpacity }} className="absolute left-1/2 top-[46%] aspect-square w-[min(150vw,880px)] sm:w-[min(100vw,880px)] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(255,110,40,0.35),transparent_68%)] blur-3xl" />
        <AuraOrb className="absolute inset-0" />
      </motion.div>

      {/* Letterbox frame */}
      <div className="frame-corners pointer-events-none absolute inset-x-4 bottom-4 top-24 sm:inset-x-8" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-center px-5 pb-28 pt-32 sm:px-10">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1 }} className="eyebrow mb-6 text-center !text-cream/60 [text-shadow:0_2px_16px_rgba(0,0,0,0.9)]">
          By InkFrame Films · The studio behind @aurakidzzz
        </motion.p>
        <h1 className="mega text-[clamp(3.4rem,12.5vw,13.5rem)] text-cream">
          <motion.span style={{ x: x1 }} className="block">
            <Line delay={0.15}>Paste a URL.</Line>
          </motion.span>
          <motion.span style={{ x: x2 }} className="block text-right">
            <Line delay={0.3}>
              Get a <span className="font-display font-normal italic tracking-[-0.02em] aura-text">series.</span>
            </Line>
          </motion.span>
        </h1>

        <motion.div style={{ opacity: fade }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 1, ease }} className="mx-auto mt-10 w-full max-w-2xl text-center">
          <p className="mx-auto mb-7 max-w-xl text-balance text-base text-cream/80 [text-shadow:0_2px_24px_rgba(0,0,0,0.9)] sm:text-lg">
            Aura Engine turns your website into micro-dramas, character series and launch films, on the formats behind <span className="text-cream">700M+ organic views</span>.
          </p>
          <ScanBox />
          <p className="mt-3 text-xs text-cream/40">Free Brand DNA, Story DNA and 3 series concepts · no card · no signup</p>
        </motion.div>
      </div>

      {/* HUD */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] items-end justify-between px-8 pb-9 font-mono text-[11px] uppercase tracking-[0.2em] text-cream/50 sm:px-14">
        <span>Reel 01 · Aura Engine</span>
        <span className="hidden items-center gap-2 sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aura" /> Rec <Timecode />
        </span>
        <span>Scroll ↓</span>
      </div>
    </section>
  );
}
