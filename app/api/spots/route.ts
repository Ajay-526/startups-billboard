import { NextRequest, NextResponse } from "next/server";
import { listActiveSpots } from "@/lib/billboard/spots";
import { isSpotAvailable } from "@/lib/billboard/availability";

export async function GET(request: NextRequest) {
  const start = request.nextUrl.searchParams.get("start");
  const end = request.nextUrl.searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ spots: await listActiveSpots() });
  }

  const startsAt = new Date(start);
  const endsAt = new Date(end);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || startsAt >= endsAt) {
    return NextResponse.json({ error: "Provide valid start and end dates with end after start." }, { status: 400 });
  }

  const spots = await listActiveSpots();
  const availability = await Promise.all(
    spots.map(async (spot) => ({
      ...spot,
      available: await isSpotAvailable(spot.id, startsAt, endsAt),
    })),
  );

  return NextResponse.json({ spots: availability, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() });
}
