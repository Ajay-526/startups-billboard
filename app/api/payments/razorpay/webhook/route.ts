import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const eventId = request.headers.get("x-razorpay-event-id");

  if (!signature || !eventId) {
    return NextResponse.json({ error: "Missing webhook signature or event id." }, { status: 400 });
  }

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string; status?: string } };
      order?: { entity?: { id?: string } };
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid webhook JSON." }, { status: 400 });
  }

  const event = payload.event ?? "";
  const paymentEntity = payload.payload?.payment?.entity;
  const orderEntity = payload.payload?.order?.entity;
  const providerId = paymentEntity?.order_id ?? orderEntity?.id;

  if (!providerId) return NextResponse.json({ received: true });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.webhookEvent.create({
        data: { provider: "razorpay", eventId, payload },
      });

      const payment = await tx.payment.findFirst({
        where: { provider: "razorpay", providerId },
        select: { id: true, campaignId: true },
      });
      if (!payment) return;

      if (event === "payment.captured" || event === "order.paid") {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", paidAt: new Date() },
        });
        await tx.campaign.updateMany({
          where: { id: payment.campaignId, status: "DRAFT" },
          data: { status: "PENDING_REVIEW" },
        });
      }

      if (event === "payment.failed") {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        });
      }
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
