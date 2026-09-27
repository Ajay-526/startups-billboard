"use client";

import * as React from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { animate } from "animejs";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { Billboard } from "@/lib/data";
import { ThreeDBillboard } from "@/components/billboard/three-d-billboard";

export function BillboardIntro({ billboard }: { billboard: Billboard }) {
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (reduced) return;
    animate(".intro-letter", {
      opacity: [0, 1],
      translateY: [24, 0],
      delay: (_el, i) => i * 22,
      duration: 700,
      ease: "out(4)",
    });
  }, [reduced]);

  return (
    <section className="relative overflow-hidden border-b border-white/[.07] pt-20 sm:pt-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_34%,rgba(90,120,255,.13),transparent_32rem)]" />
      <div className="site-shell relative">
        <div className="mb-8 flex items-center justify-between gap-6">
          <p className="eyebrow text-white/40">THE INTERNET BILLBOARD FOR BOLD BRANDS</p>
          <span className="hidden text-xs text-white/25 sm:block">EST. 2026 · ATTENTION IS THE PRODUCT</span>
        </div>

        <div className="grid min-h-[680px] items-center gap-8 pb-8 lg:grid-cols-[.82fr_1.35fr] lg:gap-0">
          <motion.div
            initial={reduced ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-20 max-w-2xl py-10 lg:pr-8"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/[.06] px-4 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-fuchsia-200">
              ✦ A media property built for attention
            </div>

            <h1 className="max-w-[9ch] text-[clamp(3.8rem,7.5vw,7.2rem)] font-black leading-[.82] tracking-[-.075em]">
              {"Get Seen by Thousands Daily".split(" ").map((word, index) => (
                <span key={word} className="intro-letter mr-[.16em] inline-block">
                  {word}
                  {index < 2 && <br />}
                </span>
              ))}
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
              A premium digital billboard where startups and brands compete for scarce, highly visible positions.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/advertise" className="inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--signal)] px-6 text-sm font-bold text-black transition-transform hover:-translate-y-0.5">
                Own the #1 Spot <ArrowUpRight size={16} />
              </Link>
              <Link href="#board" className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/[.03] px-6 text-sm font-semibold text-white hover:bg-white/[.07]">
                Explore the Board
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 border-y border-white/[.08] py-5">
              <div><p className="text-2xl font-black">50K+</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-white/35">Daily Visitors</p></div>
              <div className="border-l border-white/[.08] pl-5"><p className="text-2xl font-black">500+</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-white/35">Brands Listed</p></div>
              <div className="border-l border-white/[.08] pl-5"><p className="text-2xl font-black">10M+</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-white/35">Impressions</p></div>
            </div>

            <div className="mt-7 flex items-center gap-3 text-xs text-white/35">
              <ArrowDown size={14} />
              <span>See who owns the board</span>
              <span className="h-px w-12 bg-white/15" />
              <Link href="#board" className="hover:text-white">View rankings <ArrowUpRight size={13} className="inline" /></Link>
            </div>
          </motion.div>

          <div className="relative -mx-5 h-[560px] overflow-hidden sm:-mx-8 sm:h-[640px] lg:mx-0 lg:h-[720px]">
            <ThreeDBillboard billboard={billboard} />
            <div className="pointer-events-none absolute bottom-8 left-8 right-8 flex items-end justify-between gap-4 sm:left-12 sm:right-12">
              <div className="rounded-xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-md">
                <p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/35">CURRENT #1</p>
                <p className="mt-1 text-sm font-bold">{billboard.company}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/45 px-4 py-3 text-right backdrop-blur-md">
                <p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/35">CLAIM THIS POSITION</p>
                <p className="mt-1 text-sm font-black text-[var(--signal)]">₹{billboard.price.toLocaleString("en-IN")} / 30 DAYS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
