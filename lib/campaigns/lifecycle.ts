import { CampaignStatus } from "../../generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CampaignLifecycleResult = {
  scheduled: number;
  live: number;
  completed: number;
};

export async function syncCampaignLifecycle(now = new Date()): Promise<CampaignLifecycleResult> {
  const scheduled = await prisma.campaign.updateMany({
    where: {
      status: CampaignStatus.APPROVED,
      startsAt: { gt: now },
      endsAt: { gt: now },
    },
    data: { status: CampaignStatus.SCHEDULED },
  });

  const liveFromApproved = await prisma.campaign.updateMany({
    where: {
      status: CampaignStatus.APPROVED,
      startsAt: { lte: now },
      endsAt: { gt: now },
    },
    data: { status: CampaignStatus.LIVE },
  });

  const liveFromScheduled = await prisma.campaign.updateMany({
    where: {
      status: CampaignStatus.SCHEDULED,
      startsAt: { lte: now },
      endsAt: { gt: now },
    },
    data: { status: CampaignStatus.LIVE },
  });

  const completed = await prisma.campaign.updateMany({
    where: {
      status: { in: [CampaignStatus.LIVE, CampaignStatus.SCHEDULED, CampaignStatus.APPROVED] },
      endsAt: { lte: now },
    },
    data: { status: CampaignStatus.COMPLETED },
  });

  return {
    scheduled: scheduled.count,
    live: liveFromApproved.count + liveFromScheduled.count,
    completed: completed.count,
  };
}
