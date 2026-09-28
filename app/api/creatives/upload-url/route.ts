import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getS3Bucket, getS3Client } from "@/lib/storage/s3";
import { creativeUploadSchema } from "@/lib/creatives/validation";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const limit = rateLimit(`creative:${getClientKey(request)}`, 20, 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many upload requests." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const parsed = creativeUploadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid creative details.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { campaignId, fileName, contentType, size, altText } = parsed.data;
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerId: user.id, status: "DRAFT" },
    select: { id: true, companyId: true },
  });
  if (!campaign) return NextResponse.json({ error: "Campaign not found or not editable." }, { status: 404 });

  const allowedExtensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  const extension = allowedExtensions[contentType];
  if (!extension) return NextResponse.json({ error: "Unsupported creative type." }, { status: 400 });
  const key = `campaigns/${campaign.id}/creatives/${randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: getS3Bucket(),
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 600 });

  return NextResponse.json({
    uploadUrl,
    key,
    contentType,
    size,
    expiresIn: 600,
    next: {
      method: "PUT",
      headers: { "Content-Type": contentType },
    },
    creative: { campaignId, companyId: campaign.companyId, altText },
  });
}
