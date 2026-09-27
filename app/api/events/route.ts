import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { recordBillboardEvent } from "@/lib/analytics/events";

const eventSchema = z.object({
  type: z.enum(["IMPRESSION", "CLICK"]),
  campaignId: z.string().cuid().optional(),
  path: z.string().max(500).optional(),
  properties: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid event payload." }, { status: 400 });

  const user = await getCurrentUser();
  const event = await recordBillboardEvent({ ...parsed.data, userId: user?.id });
  if (!event && parsed.data.campaignId) {
    return NextResponse.json({ error: "Campaign is not live." }, { status: 409 });
  }

  return NextResponse.json({ event }, { status: 201 });
}
