import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Read locale from cookies (set by login page before OAuth)
  const cookieLocale = request.cookies.get("oauth_locale")?.value;
  const locale = cookieLocale ?? "en";

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=auth_callback_failed&details=no_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("exchangeCodeForSession error:", error);
    return NextResponse.redirect(
      `${origin}/${locale}/login?error=auth_callback_failed&details=${encodeURIComponent(error.message)}`
    );
  }

  // Verify the user exists in profiles — or auto-provision from seniors/donations
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user?.email) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=auth_callback_failed&details=no_user`);
  }

  let profile;
  try {
    // 1. Check existing profile
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role")
      .eq("email", user.email)
      .maybeSingle();

    profile = existingProfile;

    // 2. If no profile, check if they are a senior (applicant)
    if (!profile) {
      const { data: senior } = await supabaseAdmin
        .from("seniors")
        .select("id, email")
        .eq("email", user.email)
        .maybeSingle();

      if (senior) {
        const { error: insertError } = await supabaseAdmin.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
          role: "applicant",
        });
        if (insertError) {
          console.error("Auto-provision applicant error:", insertError);
        } else {
          profile = { id: user.id, email: user.email, role: "applicant" };
          // Link existing cases to this user
          await supabaseAdmin
            .from("cases")
            .update({ applicant_user_id: user.id })
            .eq("senior_id", senior.id)
            .is("applicant_user_id", null);
        }
      }
    }

    // 3. If still no profile, check if they are a donor
    if (!profile) {
      const { data: donation } = await supabaseAdmin
        .from("donations")
        .select("id, donor_email")
        .eq("donor_email", user.email)
        .limit(1)
        .maybeSingle();

      if (donation) {
        const { error: insertError } = await supabaseAdmin.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
          role: "donor",
        });
        if (insertError) {
          console.error("Auto-provision donor error:", insertError);
        } else {
          profile = { id: user.id, email: user.email, role: "donor" };
        }
      }
    }
  } catch (err) {
    console.error("Profile lookup/auto-provision error:", err);
  }

  if (!profile) {
    // User authenticated with Google but is NOT pre-authorized anywhere
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/${locale}/login?error=not_authorized`
    );
  }

  // Redirect based on role
  const redirectPath =
    profile.role === "applicant"
      ? `/${locale}/my-case`
      : profile.role === "donor"
      ? `/${locale}/donor`
      : `/${locale}/dashboard`;

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
