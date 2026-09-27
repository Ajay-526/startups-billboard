import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getCampaignAnalytics } from "@/lib/analytics/events";

export async function GET(_request: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { campaignId } = await params;
  const analytics = await getCampaignAnalytics(campaignId);

  return NextResponse.json({ analytics });
}
