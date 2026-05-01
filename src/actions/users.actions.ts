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

async function requireAdmin() {
  const user = await getCurrentUser();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const { error: insertError } = await supabaseAdmin.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      full_name: user.user_metadata?.full_name ?? null,
      role: "admin",
    });
    if (insertError) {
      console.error("Auto-create profile error:", insertError);
      throw new Error("Failed to auto-create admin profile");
    }
    return { user, profile: { role: "admin" } };
  }

  if (profile.role !== "admin") throw new Error("Forbidden: admin access required");
  return { user, profile };
}

export async function getUsers() {
  await requireAdmin();

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getUsers error:", error);
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createUser(formData: FormData) {
  await requireAdmin();

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
