import { z } from "zod";

export const caseSchema = z.object({
  seniorId: z.string().uuid("Senior is required"),
  serviceType: z.enum([
    "transportation",
    "housing",
    "wellness",
    "case_management",
    "benefits_navigation",
    "family_crisis",
    "funeral_support",
    "food_assistance",
    "other",
  ]),
  status: z.enum(["open", "in_progress", "pending", "resolved", "closed", "cancelled"]).default("open"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  description: z.string().min(1, "Description is required"),
  assignedTo: z.string().uuid().optional(),
  resourcesMoneyAllocated: z.coerce.number().min(0).default(0),
  volunteerHoursAllocated: z.coerce.number().min(0).default(0),
  targetDate: z.coerce.date().optional(),
  outcomeNotes: z.string().optional(),
});

export type CaseFormData = z.infer<typeof caseSchema>;
