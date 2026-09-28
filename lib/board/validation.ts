import { z } from "zod";

export const boardQuerySchema = z.object({
  board: z.enum(["all-time", "today", "daily"]).default("all-time"),
  category: z.string().trim().min(1).max(80).optional(),
  day: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const productClaimSchema = z.object({
  url: z.string().trim().url().max(2048),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  xHandle: z.string().trim().max(100).optional(),
  category: z.string().trim().min(1).max(80),
  amount: z.coerce.number().int().min(10).max(999999),
});
