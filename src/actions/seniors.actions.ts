"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { seniorSchema, type SeniorFormData } from "@/lib/validations/senior.schema";

export async function getSeniors() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("seniors").select("*").order("last_name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getSenior(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("seniors").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createSenior(formData: SeniorFormData) {
  const validated = seniorSchema.parse(formData);
  const supabase = await createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("seniors")
    .insert({
      first_name: validated.firstName,
      last_name: validated.lastName,
      date_of_birth: validated.dateOfBirth?.toISOString().split("T")[0],
      address: validated.address,
      city: validated.city,
      state: validated.state,
      zip_code: validated.zipCode,
      phone: validated.phone,
      email: validated.email || null,
      emergency_contact_name: validated.emergencyContactName,
      emergency_contact_phone: validated.emergencyContactPhone,
      primary_needs: validated.primaryNeeds,
      languages: validated.languages,
      iehp_member: validated.iehpMember,
      iehp_id: validated.iehpId,
      housing_status: validated.housingStatus,
      income_level: validated.incomeLevel,
      notes: validated.notes,
      created_by: userData.user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/en/dashboard/seniors");
  return data;
}

export async function updateSenior(id: string, formData: SeniorFormData) {
  const validated = seniorSchema.parse(formData);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("seniors")
    .update({
      first_name: validated.firstName,
      last_name: validated.lastName,
      date_of_birth: validated.dateOfBirth?.toISOString().split("T")[0],
      address: validated.address,
      city: validated.city,
      state: validated.state,
      zip_code: validated.zipCode,
      phone: validated.phone,
      email: validated.email || null,
      emergency_contact_name: validated.emergencyContactName,
      emergency_contact_phone: validated.emergencyContactPhone,
      primary_needs: validated.primaryNeeds,
      languages: validated.languages,
      iehp_member: validated.iehpMember,
      iehp_id: validated.iehpId,
      housing_status: validated.housingStatus,
      income_level: validated.incomeLevel,
      notes: validated.notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/en/dashboard/seniors");
  return data;
}

export async function deleteSenior(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("seniors").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/en/dashboard/seniors");
}
