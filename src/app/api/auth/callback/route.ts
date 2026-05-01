import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_EMAILS = ["careisccv@gmail.com", "desertpcservices@gmail.com"];

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const locale = searchParams.get("locale") ?? "en";
  const role = searchParams.get("role") ?? "staff";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Auto-provision profile after OAuth login
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existing) {
          let assignedRole = role;
          if (ADMIN_EMAILS.includes(user.email ?? "")) {
            assignedRole = "admin";
          } else if (role === "applicant") {
            assignedRole = "applicant";
          } else {
            assignedRole = "volunteer";
          }

          await supabaseAdmin.from("profiles").insert({
            id: user.id,
            email: user.email ?? "",
            full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
            role: assignedRole,
          });
        }
      }

      const redirectPath = role === "applicant" ? `/${locale}/my-case` : `/${locale}/dashboard`;
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_callback_failed`);
}
