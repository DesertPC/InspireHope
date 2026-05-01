"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

async function requireApplicant() {
  const user = await getCurrentUser();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "applicant") throw new Error("Forbidden");
  return { user, profile };
}

export async function getMyCase() {
  const { user } = await requireApplicant();

  const { data, error } = await supabaseAdmin
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
  await requireApplicant();

  const { data, error } = await supabaseAdmin
    .from("case_notes")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getMyCaseActivities(caseId: string) {
  await requireApplicant();

  const { data, error } = await supabaseAdmin
    .from("case_activities")
    .select("*")
    .eq("case_id", caseId)
    .order("activity_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getMyCaseDocuments(caseId: string) {
  await requireApplicant();

  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("case_id", caseId)
    .eq("is_confidential", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createCaseRequest(formData: FormData) {
  const { user } = await requireApplicant();

  const caseId = formData.get("case_id") as string;
  const content = formData.get("content") as string;

  if (!caseId || !content) throw new Error("Case and content are required");

  const { error } = await supabaseAdmin.from("case_notes").insert({
    case_id: caseId,
    content,
    note_type: "request",
    created_by: user.id,
  });

  if (error) throw error;
  revalidatePath("/my-case");
}
