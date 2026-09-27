import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/lib/auth/validation";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const limit = rateLimit(`auth:${path.includes("login") ? "login" : "register"}:${clientKey}`, 10, 10 * 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration details.", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
    },
    select: { id: true, email: true, name: true, role: true },
  });

  await createSession(user.id);
  return NextResponse.json({ user }, { status: 201 });
}
