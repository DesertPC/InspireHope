"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getPublicStats() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: seniorsCount },
    { count: casesCount },
    { data: donations },
    { data: expenses },
  ] = await Promise.all([
    supabase.from("seniors").select("*", { count: "exact", head: true }),
    supabase.from("cases").select("*", { count: "exact", head: true }),
    supabase.from("donations").select("amount").eq("payment_status", "succeeded"),
    supabase.from("expenses").select("amount"),
  ]);

  const totalDonations = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) ?? 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) ?? 0;

  return {
    seniorsCount: seniorsCount ?? 0,
    casesCount: casesCount ?? 0,
    totalDonations,
    totalExpenses,
    netBalance: totalDonations - totalExpenses,
  };
}

export async function getDashboardStats() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: seniorsCount },
    { count: casesCount },
    { data: donations },
    { data: expenses },
  ] = await Promise.all([
    supabase.from("seniors").select("*", { count: "exact", head: true }),
    supabase.from("cases").select("*", { count: "exact", head: true }),
    supabase.from("donations").select("amount"),
    supabase.from("expenses").select("amount"),
  ]);

  const totalDonations = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) ?? 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) ?? 0;

  return {
    seniorsCount: seniorsCount ?? 0,
    casesCount: casesCount ?? 0,
    totalDonations,
    totalExpenses,
    netBalance: totalDonations - totalExpenses,
  };
}

export async function getMonthlyFinancials() {
  const supabase = await createSupabaseServerClient();

  const { data: donations } = await supabase
    .from("donations")
    .select("amount, created_at")
    .eq("payment_status", "succeeded")
    .order("created_at", { ascending: true });

  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount, expense_date")
    .order("expense_date", { ascending: true });

  // Aggregate by month
  const months = new Map<string, { month: string; donations: number; expenses: number }>();

  donations?.forEach((d) => {
    const month = d.created_at?.slice(0, 7) ?? "unknown";
    const existing = months.get(month) || { month, donations: 0, expenses: 0 };
    existing.donations += d.amount || 0;
    months.set(month, existing);
  });

  expenses?.forEach((e) => {
    const month = e.expense_date?.slice(0, 7) ?? "unknown";
    const existing = months.get(month) || { month, donations: 0, expenses: 0 };
    existing.expenses += e.amount || 0;
    months.set(month, existing);
  });

  return Array.from(months.values()).sort((a, b) => a.month.localeCompare(b.month));
}
