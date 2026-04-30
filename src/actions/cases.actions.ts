"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCases() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("cases").select("*, seniors(first_name, last_name)").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
