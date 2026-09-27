import { CampaignStatus } from "../../generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function listAdminCampaigns() {
  return prisma.campaign.findMany({
    orderBy: [{ status: "asc" }, { startsAt: "asc" }],
    select: {
      id: true, status: true, headline: true, startsAt: true, endsAt: true,
      totalAmount: true, createdAt: true, updatedAt: true,
      company: { select: { id: true, name: true, slug: true, logoUrl: true } },
      spot: { select: { id: true, position: true, tier: true, name: true } },
      owner: { select: { id: true, email: true, name: true } },
      payments: { select: { status: true, provider: true, amount: true }, orderBy: { createdAt: "desc" }, take: 1 },
      creatives: { select: { status: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function updateCampaignStatus(id: string, status: CampaignStatus) {
  const allowed: CampaignStatus[] = [CampaignStatus.APPROVED, CampaignStatus.SCHEDULED, CampaignStatus.CANCELLED];
  if (!allowed.includes(status)) throw new Error("Unsupported admin campaign status.");

  return prisma.$transaction(async (tx) => {
    const campaign = await tx.campaign.findUnique({
      where: { id },
      select: { id: true, status: true, startsAt: true, endsAt: true },
    });
    if (!campaign) return null;

    if (status === CampaignStatus.CANCELLED && [CampaignStatus.LIVE, CampaignStatus.COMPLETED].includes(campaign.status)) {
      throw new Error("Live or completed campaigns cannot be cancelled.");
    }

    if (status === CampaignStatus.SCHEDULED) {
      if (campaign.status !== CampaignStatus.APPROVED) throw new Error("Only approved campaigns can be scheduled.");
      if (campaign.endsAt <= new Date()) throw new Error("Campaign has already ended.");
    }

    return tx.campaign.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, startsAt: true, endsAt: true },
    });
  });
}
