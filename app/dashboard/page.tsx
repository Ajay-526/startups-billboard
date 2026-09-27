import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { listAdvertiserCampaigns } from "@/lib/campaigns/dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const campaigns = await listAdvertiserCampaigns(user.id);

  return (
    <main className="site-shell py-16">
      <div className="mb-10">
        <p className="eyebrow text-[var(--signal)]">ADVERTISER CONSOLE</p>
        <h1 className="display-sm mt-3">Your campaigns.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45">
          Track billboard positions, campaign windows, payment state and creative approval from one place.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <section className="rounded-[28px] border border-white/10 bg-white/[.025] p-8">
          <p className="text-lg font-bold">No campaigns yet.</p>
          <p className="mt-2 text-sm text-white/45">Choose a billboard position and create your first campaign.</p>
          <Link href="/advertise" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--signal)] px-5 py-3 text-sm font-bold text-black">
            Choose a spot <ArrowUpRight size={15} />
          </Link>
        </section>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const payment = campaign.payments[0];
            const approved = campaign.creatives.length > 0 && campaign.creatives.every((creative) => creative.status === "APPROVED");
            return (
              <Link key={campaign.id} href={"/dashboard/campaigns/" + campaign.id} className="block rounded-[24px] border border-white/10 bg-white/[.025] p-5 transition hover:border-white/20 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.14em]">{campaign.status}</span>
                      <span className="text-xs text-white/35">Position #{campaign.spot.position}</span>
                    </div>
                    <h2 className="mt-3 truncate text-xl font-black">{campaign.headline}</h2>
                    <p className="mt-1 text-xs text-white/40">{campaign.company.name} · {campaign.spot.name}</p>
                  </div>
                  <div className="grid shrink-0 grid-cols-3 gap-5 text-xs">
                    <div><p className="text-white/30">Payment</p><p className="mt-1 font-semibold">{payment?.status ?? "PENDING"}</p></div>
                    <div><p className="text-white/30">Creative</p><p className="mt-1 font-semibold">{approved ? "Approved" : campaign.creatives.length ? "Review" : "Missing"}</p></div>
                    <div><p className="text-white/30">Amount</p><p className="mt-1 font-semibold">₹{Number(campaign.totalAmount).toLocaleString("en-IN")}</p></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
