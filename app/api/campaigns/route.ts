import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { reserveSpot } from "@/lib/billboard/availability";
import { calculateCampaignAmount } from "@/lib/campaigns/pricing";
import { campaignFieldsSchema } from "@/lib/campaigns/validation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const campaigns = await prisma.campaign.findMany({
    where: { ownerId: user.id },
    orderBy: { startsAt: "desc" },
    select: {
      id: true, companyId: true, spotId: true, status: true, headline: true,
      subheadline: true, startsAt: true, endsAt: true, totalAmount: true,
      spot: { select: { position: true, slug: true, tier: true, basePrice: true } },
      company: { select: { name: true, slug: true } },
    },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = campaignFieldsSchema.omit({ ownerId: true, totalAmount: true }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid campaign details.", details: parsed.error.flatten() }, { status: 400 });
  }

  const membership = await prisma.companyUser.findUnique({
    where: { userId_companyId: { userId: user.id, companyId: parsed.data.companyId } },
    select: { companyId: true },
  });
  if (!membership) return NextResponse.json({ error: "You do not belong to this company." }, { status: 403 });

  const spot = await prisma.spot.findUnique({
    where: { id: parsed.data.spotId },
    select: { id: true, status: true, basePrice: true },
  });
  if (!spot || spot.status !== "ACTIVE") {
    return NextResponse.json({ error: "Selected spot is not available." }, { status: 409 });
  }

  const totalAmount = calculateCampaignAmount(spot.basePrice, parsed.data.startsAt, parsed.data.endsAt);

  const campaign = await reserveSpot({
    companyId: parsed.data.companyId,
    ownerId: user.id,
    spotId: spot.id,
    headline: parsed.data.headline,
    subheadline: parsed.data.subheadline,
    startsAt: parsed.data.startsAt,
    endsAt: parsed.data.endsAt,
    totalAmount,
  });

  return NextResponse.json({
    campaign: { ...campaign, totalAmount: campaign.totalAmount.toString() },
    pricing: { basePrice: spot.basePrice.toString(), currency: "INR", periodDays: 30 },
  }, { status: 201 });
}
