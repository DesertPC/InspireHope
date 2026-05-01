"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ADMIN_EMAILS = ["careisccv@gmail.com", "desertpcservices@gmail.com"];
const FAKE_ADMIN_EMAIL = "admin@inspirehope.local";

export async function bootstrapAdmins() {
  // Verify current user is admin
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const { data: currentProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (currentProfile?.role !== "admin") {
    throw new Error("Forbidden: admin access required");
  }

  const results: string[] = [];

  // 1. Delete fake admin user if it exists
  const { data: fakeProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", FAKE_ADMIN_EMAIL)
    .maybeSingle();

  if (fakeProfile?.id) {
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(fakeProfile.id);
    if (deleteAuthError) {
      results.push(`Failed to delete fake admin auth user: ${deleteAuthError.message}`);
    } else {
      results.push(`Deleted fake admin auth user: ${FAKE_ADMIN_EMAIL}`);
    }
  }

  // 2. Upsert admin profiles for the real admin emails
  for (const email of ADMIN_EMAILS) {
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
    const authUser = listData?.users?.find((u) => u.email === email);

    if (!authUser) {
      results.push(`User not found in Auth (will auto-provision on first login): ${email}`);
      continue;
    }

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", authUser.id)
      .maybeSingle();

    if (existingProfile) {
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ role: "admin", email })
        .eq("id", authUser.id);
      if (updateError) {
        results.push(`Failed to update profile for ${email}: ${updateError.message}`);
      } else {
        results.push(`Updated profile to admin: ${email}`);
      }
    } else {
      const { error: insertError } = await supabaseAdmin.from("profiles").insert({
        id: authUser.id,
        email,
        full_name: authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null,
        role: "admin",
      });
      if (insertError) {
        results.push(`Failed to insert profile for ${email}: ${insertError.message}`);
      } else {
        results.push(`Inserted admin profile: ${email}`);
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log("Bootstrap results:", results);
}
