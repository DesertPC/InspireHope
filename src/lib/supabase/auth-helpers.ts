import { createSupabaseServerClient } from "./server";
import { supabaseAdmin } from "./admin";
import { redirect } from "next/navigation";

export async function requireAuth(locale: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  return { user: session.user, profile };
}

export async function requireAdmin(locale: string) {
  const { user, profile } = await requireAuth(locale);

  if (!profile) {
    redirect(`/${locale}/login?error=no_profile`);
  }

  if (profile.role !== "admin") {
    redirect(`/${locale}/login?error=unauthorized`);
  }

  return { user, profile };
}
