"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { caseSchema, type CaseFormData } from "@/lib/validations/case.schema";

export async function getCases() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cases")
    .select("*, seniors(first_name, last_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCase(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cases")
    .select("*, seniors(first_name, last_name), case_notes(*), case_activities(*), expenses(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createCase(formData: CaseFormData) {
  const validated = caseSchema.parse(formData);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("cases")
    .insert({
      senior_id: validated.seniorId,
      service_type: validated.serviceType,
      status: validated.status,
      priority: validated.priority,
      description: validated.description,
      assigned_to: validated.assignedTo || null,
      resources_money_allocated: validated.resourcesMoneyAllocated,
      volunteer_hours_allocated: validated.volunteerHoursAllocated,
      target_date: validated.targetDate?.toISOString().split("T")[0],
      outcome_notes: validated.outcomeNotes,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/en/dashboard/cases");
  return data;
}

export async function updateCase(id: string, formData: CaseFormData) {
  const validated = caseSchema.parse(formData);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("cases")
    .update({
      senior_id: validated.seniorId,
      service_type: validated.serviceType,
      status: validated.status,
      priority: validated.priority,
      description: validated.description,
      assigned_to: validated.assignedTo || null,
      resources_money_allocated: validated.resourcesMoneyAllocated,
      volunteer_hours_allocated: validated.volunteerHoursAllocated,
      target_date: validated.targetDate?.toISOString().split("T")[0],
      outcome_notes: validated.outcomeNotes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/en/dashboard/cases");
  return data;
}

export async function deleteCase(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("cases").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/en/dashboard/cases");
}

export async function getCaseNotes(caseId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("case_notes")
    .select("*, profiles(full_name)")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createCaseNote(caseId: string, content: string, noteType: string = "general") {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("case_notes")
    .insert({
      case_id: caseId,
      content,
      note_type: noteType,
      created_by: userData.user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/en/dashboard/cases`);
  return data;
}

export async function getCaseActivities(caseId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("case_activities")
    .select("*, profiles(full_name)")
    .eq("case_id", caseId)
    .order("activity_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createCaseActivity(
  caseId: string,
  activityType: string,
  hoursSpent: number,
  description: string,
  milesDriven: number = 0
) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("case_activities")
    .insert({
      case_id: caseId,
      volunteer_id: userData.user?.id,
      activity_type: activityType,
      hours_spent: hoursSpent,
      miles_driven: milesDriven,
      description,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/en/dashboard/cases`);
  return data;
}
