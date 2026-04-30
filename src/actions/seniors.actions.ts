"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSeniors() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("seniors").select("*").order("last_name", { ascending: true });
  if (error) throw error;
  return data;
}
