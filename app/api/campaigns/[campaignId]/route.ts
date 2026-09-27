import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAdvertiserCampaign } from "@/lib/campaigns/dashboard";

export async function GET(_request: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { campaignId } = await params;
  const campaign = await getAdvertiserCampaign(user.id, campaignId);
  if (!campaign) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });

  return NextResponse.json({ campaign });
}
