import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const cookieLocale = request.cookies.get("oauth_locale")?.value;
  const locale = cookieLocale ?? "en";

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=auth_callback_failed&details=no_code`);
  }

  const supabase = await createSupabaseServerClient();

  // exchangeCodeForSession returns the session directly — use it instead of getSession()
  const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("[OAuth Callback] exchangeCodeForSession error:", exchangeError.message);
    return NextResponse.redirect(
      `${origin}/${locale}/login?error=auth_callback_failed&details=${encodeURIComponent(exchangeError.message)}`
    );
  }

  const user = exchangeData.session?.user;

  if (!user?.email) {
    console.error("[OAuth Callback] No user or email after exchange. Session:", !!exchangeData.session);
    return NextResponse.redirect(`${origin}/${locale}/login?error=auth_callback_failed&details=no_user`);
  }

  const email = user.email.toLowerCase().trim();
  console.log("[OAuth Callback] Authenticated user:", email, "ID:", user.id);

  let profile;
  try {
    // 1. Check existing profile (case-insensitive)
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role")
      .ilike("email", email)
      .maybeSingle();

    if (existingProfile) {
      console.log("[OAuth Callback] Found existing profile:", existingProfile.role);
      profile = existingProfile;
    }

    // 2. If no profile, check if they are a senior (applicant)
    if (!profile) {
      const { data: senior } = await supabaseAdmin
        .from("seniors")
        .select("id, email")
        .ilike("email", email)
        .maybeSingle();

      if (senior) {
        console.log("[OAuth Callback] Senior found, auto-provisioning as applicant:", senior.id);
        const { error: insertError } = await supabaseAdmin.from("profiles").insert({
          id: user.id,
          email: email,
          full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
          role: "applicant",
        });
        if (insertError) {
          console.error("[OAuth Callback] Auto-provision applicant error:", insertError.message);
        } else {
          profile = { id: user.id, email: email, role: "applicant" };
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
        .ilike("donor_email", email)
        .limit(1)
        .maybeSingle();

      if (donation) {
        console.log("[OAuth Callback] Donation found, auto-provisioning as donor");
        const { error: insertError } = await supabaseAdmin.from("profiles").insert({
          id: user.id,
          email: email,
          full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
          role: "donor",
        });
        if (insertError) {
          console.error("[OAuth Callback] Auto-provision donor error:", insertError.message);
        } else {
          profile = { id: user.id, email: email, role: "donor" };
        }
      }
    }
  } catch (err: any) {
    console.error("[OAuth Callback] Profile lookup/auto-provision error:", err.message);
  }

  if (!profile) {
    console.error("[OAuth Callback] No profile, senior, or donation found for:", email);
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/${locale}/login?error=not_authorized`
    );
  }

  console.log("[OAuth Callback] Redirecting user to:", profile.role);

  const redirectPath =
    profile.role === "applicant"
      ? `/${locale}/my-case`
      : profile.role === "donor"
      ? `/${locale}/donor`
      : `/${locale}/dashboard`;

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
