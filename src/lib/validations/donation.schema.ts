import { z } from "zod";

export const donationSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be at least $1").max(100000),
  donationType: z.enum([
    "general",
    "transportation",
    "housing",
    "wellness",
    "funeral_support",
    "food_program",
    "emergency_fund",
  ]),
  isRecurring: z.boolean().default(false),
  donorName: z.string().min(1, "Name is required"),
  donorEmail: z.string().email("Valid email is required"),
  donorPhone: z.string().optional(),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  coverFees: z.boolean().default(false),
});

export type DonationFormData = z.infer<typeof donationSchema>;
