"use client";

import * as React from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { animate, stagger } from "animejs";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

export function BillboardIntro() {
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (reduced) return;
    animate(".intro-letter", {
      opacity: [0, 1],
      translateY: [30, 0],
      delay: stagger(28),
      duration: 850,
      ease: "out(4)",
    });
  }, [reduced]);

  return (
    <section className="relative overflow-hidden pb-8 pt-20 sm:pb-12 sm:pt-28">
      <div className="absolute -left-32 top-20 size-72 rounded-full bg-[var(--signal)]/[.06] blur-3xl" />
      <div className="site-shell relative">
        <div className="mb-8 flex items-end justify-between gap-6">
          <p className="eyebrow text-white/35">A MEDIA PROPERTY FOR THE INTERNET</p>
          <span className="hidden text-xs text-white/30 sm:block">EST. 2026 · ATTENTION IS THE PRODUCT</span>
        </div>
        <motion.div initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
          <h2 className="display max-w-6xl">
            {"THE BILLBOARD".split("").map((letter, index) => (
              <span className="intro-letter inline-block whitespace-pre" key={index}>{letter}</span>
            ))}
          </h2>
          <p className="mt-7 max-w-2xl text-sm leading-6 text-white/50 sm:text-base">
            A scarce digital street for startups, products and brands worth discovering. One board. Ranked by position. Built for attention.
          </p>
        </motion.div>
        <div className="mt-12 flex items-center gap-3 text-xs text-white/35">
          <ArrowDown size={14} />
          <span>See who owns the board</span>
          <span className="h-px w-16 bg-white/15" />
          <Link href="#board" className="hover:text-white">View rankings <ArrowUpRight size={13} className="inline" /></Link>
        </div>
      </div>
    </section>
  );
}
