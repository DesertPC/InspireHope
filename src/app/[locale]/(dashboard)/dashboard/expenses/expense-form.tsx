"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createExpense, updateExpense } from "@/actions/expenses.actions";
import { getCases } from "@/actions/cases.actions";
import type { ExpenseFormData } from "@/lib/validations/expense.schema";

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: any;
  onSuccess: () => void;
}

const categories = [
  { value: "transportation", label: "Transportation" },
  { value: "housing_assistance", label: "Housing Assistance" },
  { value: "wellness_programs", label: "Wellness Programs" },
  { value: "funeral_support", label: "Funeral Support" },
  { value: "food_program", label: "Food Program" },
  { value: "utilities", label: "Utilities" },
  { value: "office_supplies", label: "Office Supplies" },
  { value: "technology", label: "Technology" },
  { value: "marketing", label: "Marketing" },
  { value: "insurance", label: "Insurance" },
  { value: "legal", label: "Legal" },
  { value: "staff_salaries", label: "Staff Salaries" },
  { value: "volunteer_expenses", label: "Volunteer Expenses" },
  { value: "facility_rent", label: "Facility Rent" },
  { value: "other", label: "Other" },
];

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "stripe", label: "Stripe" },
];

export function ExpenseForm({ open, onOpenChange, expense, onSuccess }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      getCases().then(setCases).catch(console.error);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: ExpenseFormData = {
      description: formData.get("description") as string,
      amount: Number(formData.get("amount")),
      category: formData.get("category") as any,
      paymentMethod: (formData.get("paymentMethod") as any) || undefined,
      vendorName: formData.get("vendorName") as string || undefined,
      receiptNumber: formData.get("receiptNumber") as string || undefined,
      expenseDate: formData.get("expenseDate") ? new Date(formData.get("expenseDate") as string) : new Date(),
      caseId: (formData.get("caseId") as string) || undefined,
      notes: formData.get("notes") as string || undefined,
      isReimbursable: formData.get("isReimbursable") === "on",
    };

    try {
      if (expense) {
        await updateExpense(expense.id, data);
      } else {
        await createExpense(data);
      }
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input id="description" name="description" defaultValue={expense?.description} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" defaultValue={expense?.amount} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDate">Date</Label>
              <Input id="expenseDate" name="expenseDate" type="date" defaultValue={expense?.expense_date} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select name="category" defaultValue={expense?.category ?? undefined} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select name="paymentMethod" defaultValue={expense?.payment_method ?? undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendorName">Vendor</Label>
              <Input id="vendorName" name="vendorName" defaultValue={expense?.vendor_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiptNumber">Receipt #</Label>
              <Input id="receiptNumber" name="receiptNumber" defaultValue={expense?.receipt_number} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caseId">Linked Case (optional)</Label>
            <Select name="caseId" defaultValue={expense?.case_id || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select a case..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.case_number} — {c.seniors?.last_name}, {c.seniors?.first_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={expense?.notes} rows={2} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isReimbursable" name="isReimbursable" defaultChecked={expense?.is_reimbursable} />
            <Label htmlFor="isReimbursable">Reimbursable</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : expense ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
