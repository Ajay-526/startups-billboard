import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BillboardRankRow, HeroBillboard } from "@/components/billboard/billboard";
import { BillboardIntro } from "@/components/billboard/hero";
import { Button } from "@/components/ui/button";
import { listLiveCampaigns } from "@/lib/campaigns/repository";
import type { Billboard } from "@/lib/data";

function toBillboard(campaign: Awaited<ReturnType<typeof listLiveCampaigns>>[number]): Billboard {
  const accent = campaign.company.accent ?? "#DFFF4F";
  return {
    id: campaign.id,
    position: campaign.spot.position,
    tier: campaign.spot.tier.toLowerCase() as Billboard["tier"],
    company: campaign.company.name,
    logo: campaign.company.name.slice(0, 2).toUpperCase(),
    headline: campaign.headline,
    subheadline: campaign.subheadline ?? campaign.company.name,
    cta: "See company",
    price: Number(campaign.totalAmount),
    category: campaign.spot.name,
    accent,
    surface: "#11150A",
    surfaceStrong: accent,
    text: "#F4F1E8",
    logoText: "#080808",
    href: campaign.company.websiteUrl ?? "/advertise",
  };
}

export default async function HomePage() {
  const liveCampaigns = await listLiveCampaigns();
  const billboards = liveCampaigns.map(toBillboard);
  const hero = billboards[0];

  return (
    <>
      <BillboardIntro billboard={hero} />

      {hero ? (
        <section className="site-shell pb-20" aria-labelledby="current-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-[var(--signal)]">THE LIVE BOARD</p>
              <h2 id="current-heading" className="mt-2 text-xl font-bold tracking-tight">
                Position #1 belongs to {hero.company}.
              </h2>
            </div>
            <span className="hidden text-xs text-white/30 sm:block">POSITION 001 / ACTIVE</span>
          </div>
          <HeroBillboard billboard={hero} />
        </section>
      ) : (
        <section className="site-shell pb-20">
          <div className="rounded-[30px] border border-white/10 bg-white/[.025] p-8">
            <p className="eyebrow text-[var(--signal)]">THE BILLBOARD</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">The #1 spot is available.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/45">
              Launch a campaign and become the next company on the live board.
            </p>
            <Button asChild className="mt-6">
              <Link href="/advertise">Own the #1 Spot <ArrowRight size={16} /></Link>
            </Button>
          </div>
        </section>
      )}

      <section id="board" className="border-y border-white/[.07] py-20">
        <div className="site-shell">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-white/35">THE BOARD</p>
              <h2 className="display-sm mt-3 max-w-4xl">WHO&apos;S ON THE WALL.</h2>
            </div>
            <p className="max-w-sm text-xs leading-5 text-white/40">
              Live inventory is driven by approved campaigns and their scheduled windows.
            </p>
          </div>
          <div>
            {billboards.slice(1).map((billboard) => (
              <BillboardRankRow key={billboard.id} billboard={billboard} />
            ))}
          </div>
        </div>
      </section>

      <section id="own-a-spot" className="site-shell pb-24 pt-20">
        <div className="relative overflow-hidden rounded-[34px] border border-[var(--signal)]/20 bg-[var(--signal)] p-7 text-black sm:p-12 lg:p-16">
          <div className="relative z-10 max-w-4xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em]">
              <Sparkles size={15} />
              OWN THE #1 SPOT
            </div>
            <h2 className="mt-6 text-[clamp(3.5rem,8vw,8rem)] font-black leading-[.78] tracking-[-.075em]">TAKE<br />THE TOP.</h2>
            <p className="mt-8 max-w-xl text-sm leading-6 text-black/65 sm:text-base">
              Put your company in the most visible position on the board. Choose your campaign window and make the next impression count.
            </p>
            <Button asChild size="lg" className="mt-8 bg-black text-white hover:bg-[#171717]">
              <Link href="/advertise">Get the #1 Spot <ArrowRight size={16} /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
