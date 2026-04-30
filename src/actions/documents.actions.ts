"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getDocuments() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
