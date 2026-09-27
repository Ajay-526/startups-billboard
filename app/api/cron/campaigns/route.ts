import { NextResponse } from "next/server";
import { syncCampaignLifecycle } from "@/lib/campaigns/lifecycle";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await syncCampaignLifecycle();

  return NextResponse.json({
    ok: true,
    ...result,
    syncedAt: new Date().toISOString(),
  });
}
