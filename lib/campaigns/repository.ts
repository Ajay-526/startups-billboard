import { CampaignStatus } from "../../generated/prisma/client";
import { prisma } from "@/lib/prisma";

const campaignSelect = {
  id: true,
  companyId: true,
  ownerId: true,
  spotId: true,
  status: true,
  headline: true,
  subheadline: true,
  startsAt: true,
  endsAt: true,
  totalAmount: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function getCampaignById(id: string) {
  return prisma.campaign.findUnique({
    where: { id },
    select: campaignSelect,
  });
}

export async function listCompanyCampaigns(companyId: string) {
  return prisma.campaign.findMany({
    where: { companyId },
    orderBy: { startsAt: "desc" },
    select: campaignSelect,
  });
}

export async function listLiveCampaigns() {
  return prisma.campaign.findMany({
    where: { status: CampaignStatus.LIVE },
    orderBy: { spot: { position: "asc" } },
    select: {
      ...campaignSelect,
      spot: { select: { position: true, slug: true, tier: true, name: true, basePrice: true } },
      company: { select: { name: true, slug: true, logoUrl: true, accent: true, websiteUrl: true } },
      creatives: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { assetUrl: true, altText: true },
      },
    },
  });
}
