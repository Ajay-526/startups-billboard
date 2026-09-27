import { CampaignStatus, Prisma } from "../../generated/prisma/client";
import { prisma } from "@/lib/prisma";

const reservingStatuses: CampaignStatus[] = [
  CampaignStatus.PENDING_REVIEW,
  CampaignStatus.APPROVED,
  CampaignStatus.SCHEDULED,
  CampaignStatus.LIVE,
];

export async function isSpotAvailable(
  spotId: string,
  startsAt: Date,
  endsAt: Date,
) {
  if (startsAt >= endsAt) return false;

  const conflict = await prisma.campaign.findFirst({
    where: {
      spotId,
      status: { in: reservingStatuses },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
    select: { id: true },
  });

  return !conflict;
}

export async function reserveSpot(input: {
  companyId: string;
  ownerId: string;
  spotId: string;
  headline: string;
  subheadline?: string;
  startsAt: Date;
  endsAt: Date;
  totalAmount: Prisma.Decimal;
}) {
  if (input.startsAt >= input.endsAt) {
    throw new Error("Campaign end must be after campaign start.");
  }

  return prisma.$transaction(
    async (tx) => {
      const conflict = await tx.campaign.findFirst({
        where: {
          spotId: input.spotId,
          status: { in: reservingStatuses },
          startsAt: { lt: input.endsAt },
          endsAt: { gt: input.startsAt },
        },
        select: { id: true },
      });

      if (conflict) {
        throw new Error("Spot is already reserved for this campaign window.");
      }

      return tx.campaign.create({
        data: {
          companyId: input.companyId,
          ownerId: input.ownerId,
          spotId: input.spotId,
          headline: input.headline,
          subheadline: input.subheadline,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          totalAmount: input.totalAmount,
          status: CampaignStatus.DRAFT,
        },
      });
    },
    { isolationLevel: "Serializable" },
  );
}
