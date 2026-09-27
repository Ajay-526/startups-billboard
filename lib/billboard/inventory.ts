import { CampaignStatus } from "../../generated/prisma/client";
import { prisma } from "@/lib/prisma";

const blockingStatuses = [
  CampaignStatus.PENDING_REVIEW,
  CampaignStatus.APPROVED,
  CampaignStatus.SCHEDULED,
  CampaignStatus.LIVE,
];

export async function getInventoryCalendar(startsAt: Date, endsAt: Date) {
  if (startsAt >= endsAt) throw new Error("End date must be after start date.");

  return prisma.spot.findMany({
    where: { status: "ACTIVE" },
    orderBy: { position: "asc" },
    select: {
      id: true,
      position: true,
      tier: true,
      name: true,
      basePrice: true,
      campaigns: {
        where: {
          status: { in: blockingStatuses },
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
        },
        orderBy: { startsAt: "asc" },
        select: {
          id: true,
          status: true,
          startsAt: true,
          endsAt: true,
          headline: true,
          company: { select: { name: true, slug: true } },
        },
      },
    },
  });
}
