import { z } from "zod";

export const creativeUploadSchema = z.object({
  campaignId: z.string().min(1),
  fileName: z.string().trim().min(1).max(180),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  size: z.number().int().positive().max(10 * 1024 * 1024),
  altText: z.string().trim().min(3).max(240),
});

export const MAX_CREATIVE_BYTES = 10 * 1024 * 1024;
