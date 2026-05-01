"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

const ADMIN_EMAILS = ["careisccv@gmail.com", "desertpcservices@gmail.com"];
const FAKE_ADMIN_EMAIL = "admin@inspirehope.local";

export async function bootstrapAdmins() {
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
    // Find user in auth.users by email via listUsers
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1,
      // @ts-ignore — filter by email via query if supported, otherwise we scan
    });

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
