"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getMyCase() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("cases")
    .select("*, seniors(*)")
    .eq("applicant_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getMyCaseNotes(caseId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("case_notes")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getMyCaseActivities(caseId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("case_activities")
    .select("*")
    .eq("case_id", caseId)
    .order("activity_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getMyCaseDocuments(caseId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("case_id", caseId)
    .eq("is_confidential", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createCaseRequest(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const caseId = formData.get("case_id") as string;
  const content = formData.get("content") as string;

  if (!caseId || !content) throw new Error("Case and content are required");

  const { error } = await supabase.from("case_notes").insert({
    case_id: caseId,
    content,
    note_type: "request",
    created_by: user.id,
  });

  if (error) throw error;
  revalidatePath("/my-case");
}
