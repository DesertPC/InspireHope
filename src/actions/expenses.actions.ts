"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getExpenses() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false });
  if (error) throw error;
  return data;
}
