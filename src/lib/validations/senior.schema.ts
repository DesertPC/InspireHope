import { z } from "zod";

export const seniorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.coerce.date().optional(),
  address: z.string().optional(),
  city: z.string().default("Palm Desert"),
  state: z.string().default("CA"),
  zipCode: z.string().default("92260"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  primaryNeeds: z.array(z.string()).default([]),
  languages: z.array(z.string()).default(["English"]),
  iehpMember: z.boolean().default(false),
  iehpId: z.string().optional(),
  housingStatus: z.enum(["stable", "at_risk", "homeless", "temporary"]).optional(),
  incomeLevel: z.enum(["low", "moderate", "above_moderate"]).optional(),
  notes: z.string().optional(),
});

export type SeniorFormData = z.infer<typeof seniorSchema>;
