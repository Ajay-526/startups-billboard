import { prisma } from "@/lib/prisma";

export async function listAdvertiserCampaigns(userId: string) {
  return prisma.campaign.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, status: true, headline: true, subheadline: true,
      startsAt: true, endsAt: true, totalAmount: true, createdAt: true, updatedAt: true,
      company: { select: { id: true, name: true, slug: true, logoUrl: true, websiteUrl: true, accent: true } },
      spot: { select: { id: true, position: true, tier: true, name: true, basePrice: true } },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, provider: true, status: true, amount: true, currency: true, paidAt: true, createdAt: true },
      },
      creatives: {
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true, assetUrl: true, altText: true, metadata: true, createdAt: true },
      },
    },
  });
}

export async function getAdvertiserCampaign(userId: string, campaignId: string) {
  return prisma.campaign.findFirst({
    where: { id: campaignId, ownerId: userId },
    select: {
      id: true, status: true, headline: true, subheadline: true,
      startsAt: true, endsAt: true, totalAmount: true, createdAt: true, updatedAt: true,
      company: { select: { id: true, name: true, slug: true, logoUrl: true, websiteUrl: true, accent: true } },
      spot: { select: { id: true, position: true, tier: true, name: true, description: true, basePrice: true } },
      payments: {
        orderBy: { createdAt: "desc" },
        select: { id: true, provider: true, status: true, amount: true, currency: true, paidAt: true, createdAt: true },
      },
      creatives: {
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true, assetUrl: true, altText: true, metadata: true, createdAt: true },
      },
    },
  });
}
