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
