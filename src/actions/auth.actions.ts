"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  // Read locale from cookie for redirect
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "en";
  redirect(`/${locale}/login`);
}

export async function updateUserLocale(locale: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  const { error } = await supabase
    .from("profiles")
    .update({ locale })
    .eq("id", session.user.id);

  if (error) {
    console.error("updateUserLocale error:", error);
    throw new Error(error.message);
  }
}
