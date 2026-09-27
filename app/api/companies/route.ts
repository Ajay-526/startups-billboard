import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { companySchema } from "@/lib/companies/validation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const companies = await prisma.company.findMany({
    where: { users: { some: { userId: user.id } } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, slug: true, logoUrl: true, websiteUrl: true,
      description: true, accent: true, createdAt: true,
    },
  });

  return NextResponse.json({ companies });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const parsed = companySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid company details.", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.company.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true },
  });
  if (existing) return NextResponse.json({ error: "That company slug is already in use." }, { status: 409 });

  const company = await prisma.company.create({
    data: {
      ...parsed.data,
      websiteUrl: parsed.data.websiteUrl || null,
      logoUrl: parsed.data.logoUrl || null,
      users: { create: { userId: user.id } },
    },
    select: {
      id: true, name: true, slug: true, logoUrl: true, websiteUrl: true,
      description: true, accent: true, createdAt: true,
    },
  });

  return NextResponse.json({ company }, { status: 201 });
}
