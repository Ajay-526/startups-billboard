import { Prisma } from "../../generated/prisma/client";

const DAYS_PER_PERIOD = 30;

export function calculateCampaignAmount(basePrice: Prisma.Decimal | number, startsAt: Date, endsAt: Date) {
  const milliseconds = endsAt.getTime() - startsAt.getTime();
  const days = Math.max(1, Math.ceil(milliseconds / (24 * 60 * 60 * 1000)));
  const periods = Math.max(1, Math.ceil(days / DAYS_PER_PERIOD));
  const price = new Prisma.Decimal(basePrice);
  return price.mul(periods);
}
