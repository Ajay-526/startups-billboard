import { NextResponse } from "next/server";
import { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { fetchRazorpayPayment, verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  } | null;

  if (!body?.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
    return NextResponse.json({ error: "Missing Razorpay payment fields." }, { status: 400 });
  }

  const valid = verifyRazorpayPaymentSignature({
    orderId: body.razorpay_order_id,
    paymentId: body.razorpay_payment_id,
    signature: body.razorpay_signature,
  });
  if (!valid) return NextResponse.json({ error: "Invalid payment signature." }, { status: 401 });

  const payment = await prisma.payment.findFirst({
    where: {
      provider: "razorpay",
      providerId: body.razorpay_order_id,
      campaign: { ownerId: user.id },
    },
    include: { campaign: true },
  });
  if (!payment) return NextResponse.json({ error: "Payment order not found." }, { status: 404 });

  const gatewayPayment = await fetchRazorpayPayment(body.razorpay_payment_id);
  const expectedAmount = Number(new Prisma.Decimal(payment.amount).mul(100).toFixed(0));

  if (
    gatewayPayment.order_id !== body.razorpay_order_id ||
    gatewayPayment.amount !== expectedAmount ||
    gatewayPayment.currency !== payment.currency ||
    gatewayPayment.status !== "captured"
  ) {
    return NextResponse.json({ error: "Payment could not be verified as captured." }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paidAt: new Date() },
    }),
    prisma.campaign.updateMany({
      where: { id: payment.campaignId, status: "DRAFT" },
      data: { status: "PENDING_REVIEW" },
    }),
  ]);

  return NextResponse.json({ verified: true, campaignId: payment.campaignId });
}
