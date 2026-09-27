import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getInventoryCalendar } from "@/lib/billboard/inventory";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  if (!start || !end) {
    return NextResponse.json({ error: "start and end are required." }, { status: 400 });
  }

  const startsAt = new Date(start);
  const endsAt = new Date(end);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || startsAt >= endsAt) {
    return NextResponse.json({ error: "Invalid inventory window." }, { status: 400 });
  }

  return NextResponse.json({ inventory: await getInventoryCalendar(startsAt, endsAt) });
}
