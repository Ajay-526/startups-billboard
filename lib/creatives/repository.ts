import { CreativeStatus } from "../../generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function listCampaignCreatives(campaignId: string) {
  return prisma.creative.findMany({
    where: { campaignId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listPendingCreatives() {
  return prisma.creative.findMany({
    where: { status: CreativeStatus.PENDING },
    orderBy: { createdAt: "asc" },
    include: {
      company: { select: { id: true, name: true, slug: true } },
      campaign: {
        select: {
          id: true,
          headline: true,
          status: true,
          startsAt: true,
          endsAt: true,
          spot: { select: { position: true, name: true } },
        },
      },
    },
  });
}
