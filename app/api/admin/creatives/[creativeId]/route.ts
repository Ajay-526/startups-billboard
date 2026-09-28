import { NextResponse } from "next/server";
import { CreativeStatus, CampaignStatus, PaymentStatus } from "../../../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ creativeId: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { creativeId } = await params;
  const body = await request.json().catch(() => null) as { status?: string } | null;
  const nextStatus = body?.status;
  if (nextStatus !== CreativeStatus.APPROVED && nextStatus !== CreativeStatus.REJECTED) {
    return NextResponse.json({ error: "status must be APPROVED or REJECTED." }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const creative = await tx.creative.findUnique({
      where: { id: creativeId },
      select: { id: true, campaignId: true, status: true },
    });
    if (!creative) return null;

    const updatedCreative = await tx.creative.update({
      where: { id: creativeId },
      data: { status: nextStatus },
    });

    let campaignStatus: CampaignStatus | undefined;

    if (nextStatus === CreativeStatus.APPROVED) {
      const [pendingCreative, paidPayment, campaign] = await Promise.all([
        tx.creative.findFirst({
          where: { campaignId: creative.campaignId, status: CreativeStatus.PENDING },
          select: { id: true },
        }),
        tx.payment.findFirst({
          where: { campaignId: creative.campaignId, status: PaymentStatus.PAID },
          select: { id: true },
        }),
        tx.campaign.findUnique({
          where: { id: creative.campaignId },
          select: { status: true },
        }),
      ]);

      if (
        !pendingCreative &&
        paidPayment &&
        campaign?.status === CampaignStatus.PENDING_REVIEW
      ) {
        await tx.campaign.update({
          where: { id: creative.campaignId },
          data: { status: CampaignStatus.APPROVED },
        });
        campaignStatus = CampaignStatus.APPROVED;
      }
    }

    return { creative: updatedCreative, campaignStatus };
  });

  if (!result) return NextResponse.json({ error: "Creative not found." }, { status: 404 });
  return NextResponse.json(result);
}
