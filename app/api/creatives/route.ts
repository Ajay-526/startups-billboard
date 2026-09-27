import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { creativeUploadSchema } from "@/lib/creatives/validation";
import { getS3Bucket, getS3Client } from "@/lib/storage/s3";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const campaignId = new URL(request.url).searchParams.get("campaignId");
  if (!campaignId) return NextResponse.json({ error: "campaignId is required." }, { status: 400 });

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerId: user.id },
    select: { id: true },
  });
  if (!campaign) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });

  const creatives = await prisma.creative.findMany({
    where: { campaignId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ creatives });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as
    | { campaignId?: string; key?: string; assetUrl?: string; fileName?: string; contentType?: string; size?: number; altText?: string }
    | null;

  const parsed = creativeUploadSchema.safeParse({
    campaignId: body?.campaignId,
    fileName: body?.fileName,
    contentType: body?.contentType,
    size: body?.size,
    altText: body?.altText,
  });
  if (!parsed.success || !body?.key) {
    return NextResponse.json({ error: "Invalid creative details or storage key.", details: parsed.success ? undefined : parsed.error.flatten() }, { status: 400 });
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: parsed.data.campaignId, ownerId: user.id, status: "DRAFT" },
    select: { id: true, companyId: true },
  });
  if (!campaign) return NextResponse.json({ error: "Campaign not found or not editable." }, { status: 404 });

  const expectedPrefix = `campaigns/${campaign.id}/creatives/`;
  if (!body.key.startsWith(expectedPrefix)) {
    return NextResponse.json({ error: "Invalid creative storage key." }, { status: 400 });
  }

  try {
    await getS3Client().send(new HeadObjectCommand({
      Bucket: getS3Bucket(),
      Key: body.key,
    }));
  } catch {
    return NextResponse.json({ error: "Uploaded creative was not found in storage." }, { status: 409 });
  }

  const publicBase = process.env.S3_PUBLIC_URL?.replace(/\\/$/, "");
  const assetUrl = body.assetUrl?.trim() || (publicBase ? `${publicBase}/${body.key}` : body.key);
  const creative = await prisma.creative.create({
    data: {
      campaignId: campaign.id,
      companyId: campaign.companyId,
      assetUrl,
      altText: parsed.data.altText,
      metadata: {
        fileName: parsed.data.fileName,
        contentType: parsed.data.contentType,
        size: parsed.data.size,
        storageKey: body.key,
      },
    },
  });

  return NextResponse.json({ creative }, { status: 201 });
}
