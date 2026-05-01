"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { testimonialSchema, type TestimonialFormData } from "@/lib/validations/testimonial.schema";

export async function getTestimonials() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getApprovedTestimonials() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTestimonial(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createTestimonial(formData: TestimonialFormData) {
  const validated = testimonialSchema.parse(formData);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("testimonials")
    .insert({
      name: validated.name,
      email: validated.email,
      content: validated.content,
      status: validated.status,
      rating: validated.rating,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/en/dashboard/testimonials");
  revalidatePath("/en/testimonials");
  revalidatePath("/es/testimonials");
  revalidatePath("/en");
  revalidatePath("/es");
  return data;
}

export async function updateTestimonial(id: string, formData: TestimonialFormData) {
  const validated = testimonialSchema.parse(formData);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("testimonials")
    .update({
      name: validated.name,
      email: validated.email,
      content: validated.content,
      status: validated.status,
      rating: validated.rating,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/en/dashboard/testimonials");
  revalidatePath("/en/testimonials");
  revalidatePath("/es/testimonials");
  revalidatePath("/en");
  revalidatePath("/es");
  return data;
}

export async function updateTestimonialStatus(id: string, status: "pending" | "approved" | "rejected") {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("testimonials")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/en/dashboard/testimonials");
  revalidatePath("/en/testimonials");
  revalidatePath("/es/testimonials");
  revalidatePath("/en");
  revalidatePath("/es");
  return data;
}

export async function deleteTestimonial(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/en/dashboard/testimonials");
  revalidatePath("/en/testimonials");
  revalidatePath("/es/testimonials");
  revalidatePath("/en");
  revalidatePath("/es");
}
