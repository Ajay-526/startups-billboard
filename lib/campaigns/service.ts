import { Prisma } from "../../generated/prisma/client";
import { reserveSpot } from "@/lib/billboard/availability";
import { campaignInputSchema } from "@/lib/campaigns/validation";

export async function createCampaign(input: unknown) {
  const parsed = campaignInputSchema.parse(input);

  return reserveSpot({
    ...parsed,
    totalAmount: new Prisma.Decimal(parsed.totalAmount),
  });
}
