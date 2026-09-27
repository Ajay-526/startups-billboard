import { NextResponse } from "next/server";
import { Prisma } from "../../../../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { createRazorpayOrder } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as { campaignId?: string } | null;
  if (!body?.campaignId) return NextResponse.json({ error: "campaignId is required." }, { status: 400 });

  const campaign = await prisma.campaign.findFirst({
    where: { id: body.campaignId, ownerId: user.id, status: "DRAFT" },
    include: { company: true, spot: true },
  });
  if (!campaign) return NextResponse.json({ error: "Campaign not found or not payable." }, { status: 404 });

  const amountPaise = Number(new Prisma.Decimal(campaign.totalAmount).mul(100).toFixed(0));
  if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
    return NextResponse.json({ error: "Campaign amount is invalid." }, { status: 422 });
  }

  const existing = await prisma.payment.findFirst({
    where: { campaignId: campaign.id, status: "PENDING", provider: "razorpay" },
    select: { providerId: true, amount: true, currency: true },
  });
  if (existing?.providerId) {
    return NextResponse.json({
      orderId: existing.providerId,
      amount: Number(new Prisma.Decimal(existing.amount).mul(100).toFixed(0)),
      currency: existing.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  }

  const order = await createRazorpayOrder({
    amountPaise,
    currency: "INR",
    receipt: `campaign_${campaign.id}`,
    notes: { campaignId: campaign.id, spotId: campaign.spotId },
  });

  await prisma.payment.create({
    data: {
      campaignId: campaign.id,
      provider: "razorpay",
      providerId: order.id,
      status: "PENDING",
      amount: campaign.totalAmount,
      currency: "INR",
    },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  }, { status: 201 });
}
