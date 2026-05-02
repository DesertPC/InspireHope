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
  const [casesLoading, setCasesLoading] = useState(false);

  // Controlled form state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [caseId, setCaseId] = useState("");
  const [notes, setNotes] = useState("");
  const [isReimbursable, setIsReimbursable] = useState(false);

  useEffect(() => {
    if (open) {
      setCasesLoading(true);
      getCases()
        .then((data) => {
          setCases(data || []);
        })
        .catch(console.error)
        .finally(() => setCasesLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (expense) {
      setDescription(expense.description ?? "");
      setAmount(expense.amount?.toString() ?? "");
      setExpenseDate(expense.expense_date ?? "");
      setCategory(expense.category ?? "");
      setPaymentMethod(expense.payment_method ?? "");
      setVendorName(expense.vendor_name ?? "");
      setReceiptNumber(expense.receipt_number ?? "");
      setCaseId(expense.case_id ?? "");
      setNotes(expense.notes ?? "");
      setIsReimbursable(expense.is_reimbursable ?? false);
    } else {
      // Reset for new expense
      setDescription("");
      setAmount("");
      setExpenseDate("");
      setCategory("");
      setPaymentMethod("");
      setVendorName("");
      setReceiptNumber("");
      setCaseId("");
      setNotes("");
      setIsReimbursable(false);
    }
    setError(null);
  }, [expense]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data: ExpenseFormData = {
      description: description.trim(),
      amount: Number(amount),
      category: category as any,
      paymentMethod: (paymentMethod as ExpenseFormData["paymentMethod"]) || undefined,
      vendorName: vendorName.trim() || undefined,
      receiptNumber: receiptNumber.trim() || undefined,
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      caseId: caseId || undefined,
      notes: notes.trim() || undefined,
      isReimbursable,
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
            <Input
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDate">Date</Label>
              <Input
                id="expenseDate"
                name="expenseDate"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
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
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod">
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
              <Input
                id="vendorName"
                name="vendorName"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiptNumber">Receipt #</Label>
              <Input
                id="receiptNumber"
                name="receiptNumber"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caseId">Linked Case (optional)</Label>
            <Select value={caseId} onValueChange={setCaseId} disabled={casesLoading}>
              <SelectTrigger id="caseId">
                <SelectValue placeholder={casesLoading ? "Loading cases..." : "Select a case..."} />
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
            <Textarea
              id="notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isReimbursable"
              name="isReimbursable"
              checked={isReimbursable}
              onCheckedChange={(checked) => setIsReimbursable(checked === true)}
            />
            <Label htmlFor="isReimbursable">Reimbursable</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !category}>
              {loading ? "Saving..." : expense ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
