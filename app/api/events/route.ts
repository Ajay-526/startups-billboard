import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { recordBillboardEvent } from "@/lib/analytics/events";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";

const eventSchema = z.object({
  type: z.enum(["IMPRESSION", "CLICK"]),
  campaignId: z.string().cuid().optional(),
  path: z.string().trim().max(500).optional(),
  properties: z.record(z.unknown()).optional(),
}).strict();

const MAX_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const limit = rateLimit(`events:${clientKey}`, 120, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests." }, {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSeconds) },
    });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request payload is too large." }, { status: 413 });
  }

  const rawBody = await request.text().catch(() => "");
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request payload is too large." }, { status: 413 });
  }

  let body: unknown = null;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid event payload." }, { status: 400 });

  try {
    const user = await getCurrentUser();
    const event = await recordBillboardEvent({ ...parsed.data, userId: user?.id });
    if (!event && parsed.data.campaignId) {
      return NextResponse.json({ error: "Campaign is not live." }, { status: 409 });
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to record event." }, { status: 500 });
  }
}
