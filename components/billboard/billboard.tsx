"use client";

import Link from "next/link";
import { ArrowUpRight, MoveUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import type { Billboard } from "@/lib/data";

const themeStyle=(b:Billboard)=>({"--brand-accent":b.accent,"--brand-surface":b.surface,"--brand-strong":b.surfaceStrong,"--brand-text":b.text,"--brand-logo-text":b.logoText} as CSSProperties);

export function BillboardRankRow({ billboard }: { billboard: Billboard }) {
  return (
    <motion.article initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45 }} className="group border-t border-white/[.09]" style={themeStyle(billboard)}>
      <Link href={billboard.href} className="grid gap-5 py-6 sm:grid-cols-[90px_minmax(0,1fr)_auto] sm:items-center" aria-label={"Position " + billboard.position + ": " + billboard.company}>
        <div className="flex items-center justify-between sm:block"><span className="font-mono text-3xl font-black tracking-[-.06em] text-white/25 transition-colors group-hover:text-[var(--brand-accent)]">{String(billboard.position).padStart(3,"0")}</span><span className="rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.16em] sm:hidden" style={{borderColor:"color-mix(in srgb, var(--brand-accent) 35%, transparent)",color:"var(--brand-accent)"}}>{billboard.category}</span></div>
        <div className="min-w-0"><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg text-[10px] font-black" style={{background:"var(--brand-strong)",color:"var(--brand-logo-text)"}}>{billboard.logo}</span><p className="text-sm font-bold">{billboard.company}</p><span className="hidden rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.16em] sm:inline" style={{borderColor:"color-mix(in srgb, var(--brand-accent) 35%, transparent)",color:"var(--brand-accent)"}}>{billboard.category}</span></div><h3 className="mt-3 text-[clamp(1.45rem,3vw,2.7rem)] font-black leading-none tracking-[-.05em]">{billboard.headline}</h3></div>
        <div className="flex items-center justify-between gap-5 sm:justify-end"><p className="max-w-sm text-xs leading-5 text-white/40 sm:text-right">{billboard.subheadline}</p><ArrowUpRight size={18} className="shrink-0 text-white/30 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" style={{color:"var(--brand-accent)"}} /></div>
      </Link>
    </motion.article>
  );
}

export function BillboardCard({ billboard }: { billboard: Billboard }) {
  return (
    <motion.article whileHover={{ y: -6 }} transition={{ type:"spring", stiffness:320, damping:25 }} className="group" style={themeStyle(billboard)}>
      <Link href={billboard.href} className="block" aria-label={billboard.company + ": " + billboard.headline}>
        <div className="billboard-frame aspect-[1.72/1] p-5 sm:p-7" style={{background:"radial-gradient(circle at 75% 20%, color-mix(in srgb, var(--brand-accent) 32%, transparent), transparent 34%), linear-gradient(135deg,var(--brand-surface),#090909)",borderColor:"color-mix(in srgb, var(--brand-accent) 45%, transparent)"}}>
          <div className="relative z-10 flex h-full flex-col justify-between"><div className="flex items-start justify-between"><span className="rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em]" style={{borderColor:"color-mix(in srgb, var(--brand-accent) 35%, transparent)",color:"var(--brand-accent)"}}>{billboard.category}</span><span className="grid size-10 place-items-center rounded-xl text-xs font-black" style={{background:"var(--brand-strong)",color:"var(--brand-logo-text)"}}>{billboard.logo}</span></div><div><h3 className="max-w-[18ch] text-[clamp(1.6rem,3.4vw,3.4rem)] font-black leading-[.9] tracking-[-.055em]">{billboard.headline}</h3><p className="mt-3 max-w-[44ch] text-xs leading-5 text-white/55 sm:text-sm">{billboard.subheadline}</p></div><div className="flex items-center justify-between border-t pt-4" style={{borderColor:"color-mix(in srgb, var(--brand-accent) 20%, transparent)"}}><span className="text-xs font-semibold">{billboard.company}</span><span className="flex items-center gap-1 text-xs font-semibold" style={{color:"var(--brand-accent)"}}>{billboard.cta}<MoveUpRight size={13}/></span></div></div>
        </div>
      </Link>
    </motion.article>
  );
}

export function HeroBillboard({ billboard }: { billboard: Billboard }) {
  return (
    <div className="billboard-frame billboard-grid min-h-[520px] p-6 sm:min-h-[620px] sm:p-10 lg:min-h-[680px] lg:p-14" style={{...themeStyle(billboard),background:"radial-gradient(circle at 72% 24%, color-mix(in srgb, var(--brand-accent) 26%, transparent), transparent 30%), linear-gradient(135deg,var(--brand-surface) 0%,#0a0a0a 68%)",borderColor:"color-mix(in srgb, var(--brand-accent) 48%, transparent)"}}>
      <div className="absolute right-[-8%] top-[12%] size-[44vw] max-h-[560px] max-w-[560px] rounded-full border bg-white/[.015]" style={{borderColor:"color-mix(in srgb, var(--brand-accent) 22%, transparent)"}}/><div className="absolute right-[9%] top-[25%] size-[24vw] max-h-[300px] max-w-[300px] rounded-full border" style={{borderColor:"color-mix(in srgb, var(--brand-accent) 30%, transparent)"}}/>
      <div className="relative z-10 flex h-full min-h-[468px] flex-col justify-between sm:min-h-[540px]"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow" style={{color:"var(--brand-accent)"}}>CURRENT #1</p><p className="mt-2 text-xs text-white/45">Live billboard · Prime attention</p></div><span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[10px] uppercase tracking-[.14em] text-white/55">Ends in 18 days</span></div>
        <div className="max-w-5xl"><div className="mb-6 flex flex-wrap items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl text-sm font-black" style={{background:"var(--brand-strong)",color:"var(--brand-logo-text)"}}>{billboard.logo}</span><span className="text-sm font-semibold">{billboard.company}</span><span className="rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em]" style={{borderColor:"color-mix(in srgb, var(--brand-accent) 38%, transparent)",background:"color-mix(in srgb, var(--brand-accent) 9%, transparent)",color:"var(--brand-accent)"}}>#1 spot · ₹{billboard.price.toLocaleString("en-IN")}</span></div><h1 className="max-w-[11ch] text-[clamp(3.8rem,9vw,9rem)] font-black leading-[.79] tracking-[-.075em]">{billboard.headline}</h1><p className="mt-7 max-w-[48ch] text-sm leading-6 text-white/58 sm:text-base">{billboard.subheadline}</p><Link href={billboard.href} className="mt-8 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold backdrop-blur" style={{borderColor:"color-mix(in srgb, var(--brand-accent) 38%, transparent)",background:"color-mix(in srgb, var(--brand-accent) 9%, transparent)",color:"var(--brand-accent)"}}>See {billboard.company}<ArrowUpRight size={15}/></Link></div>
        <div className="flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-end sm:justify-between" style={{borderColor:"color-mix(in srgb, var(--brand-accent) 18%, transparent)"}}><p className="max-w-md text-xs leading-5 text-white/42">The #1 position is scarce by design. One active owner. One campaign window. One very visible spot.</p><div className="text-right"><p className="eyebrow" style={{color:"color-mix(in srgb, var(--brand-accent) 70%, white 30%)"}}>GRAB #1</p><p className="mt-1 text-lg font-black tracking-tight">₹{billboard.price.toLocaleString("en-IN")}</p></div><span className="eyebrow text-white/35">THE BILLBOARD / 001</span></div>
      </div>
    </div>
  );
}
