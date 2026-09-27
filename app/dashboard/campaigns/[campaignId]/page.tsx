import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getAdvertiserCampaign } from "@/lib/campaigns/dashboard";
import { getCampaignAnalytics } from "@/lib/analytics/events";

export default async function CampaignDashboardPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { campaignId } = await params;
  const campaign = await getAdvertiserCampaign(user.id, campaignId);
  if (!campaign) notFound();

  const analytics = await getCampaignAnalytics(campaignId, user.id);
  if (!analytics) notFound();

  return (
    <main className="site-shell py-16">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-white">
        <ArrowLeft size={14} /> Back to campaigns
      </Link>

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-[var(--signal)]">CAMPAIGN / POSITION {String(campaign.spot.position).padStart(3, "0")}</p>
          <h1 className="display-sm mt-3">{campaign.headline}</h1>
          <p className="mt-3 text-sm text-white/45">{campaign.company.name} · {campaign.status}</p>
        </div>
        {campaign.company.websiteUrl && (
          <a href={campaign.company.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-white/55 hover:text-white">
            Company website <ExternalLink size={13} />
          </a>
        )}
      </div>

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs text-white/35">Impressions</p><p className="mt-2 text-3xl font-black">{analytics.impressions.toLocaleString("en-IN")}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs text-white/35">Clicks</p><p className="mt-2 text-3xl font-black">{analytics.clicks.toLocaleString("en-IN")}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs text-white/35">CTR</p><p className="mt-2 text-3xl font-black">{(analytics.ctr * 100).toFixed(2)}%</p></div>
      </section>

      <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[.025] p-6">
        <h2 className="text-lg font-bold">Campaign details</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-xs text-white/30">Status</dt><dd className="mt-1 text-sm font-semibold">{campaign.status}</dd></div>
          <div><dt className="text-xs text-white/30">Amount</dt><dd className="mt-1 text-sm font-semibold">₹{Number(campaign.totalAmount).toLocaleString("en-IN")}</dd></div>
          <div><dt className="text-xs text-white/30">Starts</dt><dd className="mt-1 text-sm font-semibold">{campaign.startsAt.toLocaleString("en-IN")}</dd></div>
          <div><dt className="text-xs text-white/30">Ends</dt><dd className="mt-1 text-sm font-semibold">{campaign.endsAt.toLocaleString("en-IN")}</dd></div>
        </dl>
      </section>
    </main>
  );
}
