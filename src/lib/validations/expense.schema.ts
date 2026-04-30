import { z } from "zod";

export const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  category: z.enum([
    "transportation",
    "housing_assistance",
    "wellness_programs",
    "funeral_support",
    "food_program",
    "utilities",
    "office_supplies",
    "technology",
    "marketing",
    "insurance",
    "legal",
    "staff_salaries",
    "volunteer_expenses",
    "facility_rent",
    "other",
  ]),
  paymentMethod: z.enum(["cash", "check", "credit_card", "debit_card", "bank_transfer", "stripe"]).optional(),
  vendorName: z.string().optional(),
  receiptNumber: z.string().optional(),
  expenseDate: z.coerce.date().default(new Date()),
  caseId: z.string().uuid().optional(),
  notes: z.string().optional(),
  isReimbursable: z.boolean().default(false),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
