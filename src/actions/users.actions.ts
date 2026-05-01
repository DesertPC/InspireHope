"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if current user is admin — use maybeSingle to avoid crashing
  // if the user was created directly in Auth without a profiles row.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("getUsers profile error:", profileError);
    throw new Error("Failed to verify admin status");
  }

  if (profile?.role !== "admin") {
    throw new Error("Forbidden: admin access required");
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getUsers supabaseAdmin error:", error);
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createUser(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") throw new Error("Forbidden");

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = (formData.get("role") as string) || "volunteer";

  if (!email || !password || password.length < 6) {
    throw new Error("Email is required and password must be at least 6 characters");
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Failed to create user");

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: authData.user.id,
    email,
    full_name: fullName || null,
    role,
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw profileError;
  }

  revalidatePath("/en/dashboard/users");
}
