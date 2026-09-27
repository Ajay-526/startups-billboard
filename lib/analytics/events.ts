import { prisma } from "@/lib/prisma";

export type BillboardEventInput = {
  type: "IMPRESSION" | "CLICK";
  campaignId?: string;
  path?: string;
  userId?: string;
  properties?: Record<string, unknown>;
};

export async function recordBillboardEvent(input: BillboardEventInput) {
  return prisma.event.create({
    data: {
      type: input.type,
      campaignId: input.campaignId,
      userId: input.userId,
      path: input.path,
      properties: input.properties,
    },
    select: { id: true, type: true, occurredAt: true },
  });
}

export async function getCampaignAnalytics(campaignId: string) {
  const [impressions, clicks] = await Promise.all([
    prisma.event.count({ where: { campaignId, type: "IMPRESSION" } }),
    prisma.event.count({ where: { campaignId, type: "CLICK" } }),
  ]);

  return {
    impressions,
    clicks,
    ctr: impressions > 0 ? clicks / impressions : 0,
  };
}
