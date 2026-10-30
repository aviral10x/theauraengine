"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

const TEXT =
  "Every platform will turn your URL into an ad for free now. That's the floor, not the edge. People don't follow ads. They follow characters, cliffhangers and worlds. A season builds an audience you own. An ad is forgotten by Friday.";
const HIGHLIGHT = new Set(["characters,", "cliffhangers", "worlds.", "own."]);

function Word({ w, progress, range }: { w: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className={`mr-[0.22em] inline-block ${HIGHLIGHT.has(w) ? "font-display font-normal italic text-aura-2" : ""}`}>
      {w}
    </motion.span>
  );
}

/** Kinetic manifesto: words light up as you scroll. */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.45"] });
  const words = TEXT.split(" ");
  return (
    <section ref={ref} className="relative mx-auto max-w-[1300px] px-5 py-[22vh] sm:px-10">
      <p className="eyebrow mb-8">Why series</p>
      <p className="font-grotesk text-[clamp(1.9rem,4.6vw,4.4rem)] font-semibold leading-[1.08] tracking-[-0.035em]">
        {words.map((w, i) => (
          <Word key={i} w={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </p>
      <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["One-off UGC ad", "Recurring characters people follow"],
          ["AI actor posing as a customer", "Fiction with disclosure. Compliant by design"],
          ["Built for a 3-day ad flight", "Episodes that keep compounding"],
          ["A tool, and you're on your own", "Engine + distribution + a real studio"],
        ].map(([a, b]) => (
          <div key={a} className="bg-ink p-6">
            <p className="text-sm text-cream/35 line-through decoration-cream/20">{a}</p>
            <p className="mt-3 font-grotesk text-xl font-semibold leading-snug">{b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
