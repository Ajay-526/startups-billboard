import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { creativeUploadSchema } from "@/lib/creatives/validation";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";
import { getS3Bucket, getS3Client } from "@/lib/storage/s3";

const MAX_OBJECT_BYTES = 10 * 1024 * 1024;

async function readMagicBytes(key: string) {
  const response = await getS3Client().send(new GetObjectCommand({
    Bucket: getS3Bucket(),
    Key: key,
    Range: "bytes=0-15",
  }));
  if (!response.Body) throw new Error("Missing storage object body.");
  const bytes = new Uint8Array(await response.Body.transformToByteArray());
  return bytes;
}

function matchesSignature(bytes: Uint8Array, contentType: string) {
  const startsWith = (...values: number[]) => values.every((value, index) => bytes[index] === value);

  if (contentType === "image/jpeg") return startsWith(0xff, 0xd8, 0xff);
  if (contentType === "image/png") return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  if (contentType === "image/webp") return startsWith(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  if (contentType === "image/avif") return bytes.length >= 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && (bytes[8] === 0x61 || bytes[8] === 0x6d) && (bytes[9] === 0x76 || bytes[9] === 0x73) && bytes[10] === 0x69 && bytes[11] === 0x66;
  return false;
}

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
  const limit = rateLimit(`creative:${getClientKey(request)}`, 20, 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many upload requests." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as
    | { campaignId?: string; key?: string; fileName?: string; contentType?: string; size?: number; altText?: string }
    | null;

  const parsed = creativeUploadSchema.safeParse({
    campaignId: body?.campaignId,
    fileName: body?.fileName,
    contentType: body?.contentType,
    size: body?.size,
    altText: body?.altText,
  });
  if (!parsed.success || !body?.key) {
    return NextResponse.json({ error: "Invalid creative details or storage key." }, { status: 400 });
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: parsed.data.campaignId, ownerId: user.id, status: "DRAFT" },
    select: { id: true, companyId: true },
  });
  if (!campaign) return NextResponse.json({ error: "Campaign not found or not editable." }, { status: 404 });

  const expectedPrefix = `campaigns/${campaign.id}/creatives/`;
  if (!body.key.startsWith(expectedPrefix) || body.key.includes("..") || body.key.length > 300) {
    return NextResponse.json({ error: "Invalid creative storage key." }, { status: 400 });
  }

  try {
    const head = await getS3Client().send(new HeadObjectCommand({
      Bucket: getS3Bucket(),
      Key: body.key,
    }));
    if (!head.ContentLength || head.ContentLength !== parsed.data.size || head.ContentLength > MAX_OBJECT_BYTES) {
      return NextResponse.json({ error: "Uploaded creative size does not match the declared file." }, { status: 409 });
    }

    const magic = await readMagicBytes(body.key);
    if (!matchesSignature(magic, parsed.data.contentType)) {
      return NextResponse.json({ error: "Uploaded creative content does not match its declared image type." }, { status: 415 });
    }

    const publicBase = process.env.S3_PUBLIC_URL?.replace(/\/$/, "");
    const assetUrl = publicBase ? `${publicBase}/${body.key}` : body.key;
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
  } catch {
    return NextResponse.json({ error: "Unable to verify uploaded creative." }, { status: 502 });
  }
}
