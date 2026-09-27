import { z } from "zod";

export const companySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens."),
  websiteUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional(),
  logoUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
  accent: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});
