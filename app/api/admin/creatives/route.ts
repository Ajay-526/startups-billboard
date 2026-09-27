import { NextResponse } from "next/server";
import { CreativeStatus } from "../../../../generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { listPendingCreatives } from "@/lib/creatives/repository";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  return NextResponse.json({ creatives: await listPendingCreatives() });
}
