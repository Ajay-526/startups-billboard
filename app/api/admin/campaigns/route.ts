import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listAdminCampaigns } from "@/lib/campaigns/admin";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  return NextResponse.json({ campaigns: await listAdminCampaigns() });
}
