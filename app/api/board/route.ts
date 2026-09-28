import { NextResponse } from "next/server";
import { boardQuerySchema } from "@/lib/board/validation";
import { getBoard } from "@/lib/board/ranking";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = boardQuerySchema.safeParse({
    board: url.searchParams.get("board") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    day: url.searchParams.get("day") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid board query." }, { status: 400 });
  }

  try {
    const result = await getBoard({
      board: parsed.data.board,
      categorySlug: parsed.data.category,
      day: parsed.data.day ? new Date(parsed.data.day) : undefined,
      page: parsed.data.page,
      limit: parsed.data.limit,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Unable to load the board." }, { status: 500 });
  }
}
