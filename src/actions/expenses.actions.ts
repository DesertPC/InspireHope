"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { expenseSchema, type ExpenseFormData } from "@/lib/validations/expense.schema";

export async function getExpenses() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*, cases(case_number, seniors(first_name, last_name))")
    .order("expense_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getExpense(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*, cases(case_number, seniors(first_name, last_name))")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createExpense(formData: ExpenseFormData) {
  const validated = expenseSchema.parse(formData);
  const supabase = await createSupabaseServerClient();

  const { data: { session } } = await supabase.auth.getSession();

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      description: validated.description,
      amount: validated.amount,
      category: validated.category,
      payment_method: validated.paymentMethod,
      vendor_name: validated.vendorName,
      receipt_number: validated.receiptNumber,
      expense_date: validated.expenseDate.toISOString().split("T")[0],
      case_id: validated.caseId || null,
      notes: validated.notes,
      is_reimbursable: validated.isReimbursable,
      approved_by: session?.user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/en/dashboard/expenses");
  return data;
}

export async function updateExpense(id: string, formData: ExpenseFormData) {
  const validated = expenseSchema.parse(formData);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("expenses")
    .update({
      description: validated.description,
      amount: validated.amount,
      category: validated.category,
      payment_method: validated.paymentMethod,
      vendor_name: validated.vendorName,
      receipt_number: validated.receiptNumber,
      expense_date: validated.expenseDate.toISOString().split("T")[0],
      case_id: validated.caseId || null,
      notes: validated.notes,
      is_reimbursable: validated.isReimbursable,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/en/dashboard/expenses");
  return data;
}

export async function deleteExpense(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/en/dashboard/expenses");
}
