import { NextResponse } from "next/server";
import { CampaignStatus } from "../../../../../generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { updateCampaignStatus } from "@/lib/campaigns/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const { campaignId } = await params;
  const body = await request.json().catch(() => null) as { status?: string } | null;
  if (!body?.status || !Object.values(CampaignStatus).includes(body.status as CampaignStatus)) {
    return NextResponse.json({ error: "Invalid campaign status." }, { status: 400 });
  }

  try {
    const campaign = await updateCampaignStatus(campaignId, body.status as CampaignStatus);
    if (!campaign) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    return NextResponse.json({ campaign });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update campaign." }, { status: 409 });
  }
}
