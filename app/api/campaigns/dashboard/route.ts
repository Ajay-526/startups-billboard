import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listAdvertiserCampaigns } from "@/lib/campaigns/dashboard";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const campaigns = await listAdvertiserCampaigns(user.id);
  return NextResponse.json({ campaigns });
}
