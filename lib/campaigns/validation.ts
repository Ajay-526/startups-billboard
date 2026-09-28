import { z } from "zod";

export const campaignFieldsSchema = z.object({
  companyId: z.string().min(1),
  ownerId: z.string().min(1),
  spotId: z.string().min(1),
  headline: z.string().trim().min(3).max(120),
  subheadline: z.string().trim().max(240).optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  totalAmount: z.coerce.number().positive(),
});

export const campaignInputSchema = campaignFieldsSchema.superRefine((value, ctx) => {
  if (value.startsAt >= value.endsAt) {
    ctx.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: "Campaign end must be after campaign start.",
    });
  }
});
