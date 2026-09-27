import { NextResponse } from "next/server";
import { CreativeStatus } from "../../../../../generated/prisma/client";
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
  if (body?.status !== CreativeStatus.APPROVED && body?.status !== CreativeStatus.REJECTED) {
    return NextResponse.json({ error: "status must be APPROVED or REJECTED." }, { status: 400 });
  }

  const creative = await prisma.creative.update({
    where: { id: creativeId },
    data: { status: body.status },
  });

  return NextResponse.json({ creative });
}
