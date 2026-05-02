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
  console.log("[OAuth Callback] Authenticated email:", email, "User ID:", user.id);

  let profile: { id: string; email: string; role: string } | null = null;

  try {
    // 1. Check existing profile
    console.log("[OAuth Callback] Searching profiles for:", email);
    const { data: profilesRows, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role")
      .ilike("email", email)
      .limit(1);

    if (profileError) {
      console.error("[OAuth Callback] Profile query error:", profileError.message);
    } else {
      console.log("[OAuth Callback] Profile query result count:", profilesRows?.length ?? 0);
    }

    const existingProfile = profilesRows?.[0] ?? null;

    if (existingProfile) {
      console.log("[OAuth Callback] Found existing profile:", existingProfile.role);
      profile = existingProfile;
    }

    // 2. If no profile, check if they are a senior (applicant)
    if (!profile) {
      console.log("[OAuth Callback] Searching seniors for:", email);
      const { data: seniorsRows, error: seniorError } = await supabaseAdmin
        .from("seniors")
        .select("id, email")
        .ilike("email", email)
        .limit(1);

      if (seniorError) {
        console.error("[OAuth Callback] Senior query error:", seniorError.message);
      } else {
        console.log("[OAuth Callback] Senior query result count:", seniorsRows?.length ?? 0);
      }

      const senior = seniorsRows?.[0] ?? null;

      if (senior) {
        console.log("[OAuth Callback] Senior found, auto-provisioning as applicant. Senior ID:", senior.id);
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
      console.log("[OAuth Callback] Searching donations for:", email);
      const { data: donationsRows, error: donationError } = await supabaseAdmin
        .from("donations")
        .select("id, donor_email")
        .ilike("donor_email", email)
        .limit(1);

      if (donationError) {
        console.error("[OAuth Callback] Donation query error:", donationError.message);
      } else {
        console.log("[OAuth Callback] Donation query result count:", donationsRows?.length ?? 0);
      }

      const donation = donationsRows?.[0] ?? null;

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
    console.error("[OAuth Callback] Profile lookup/auto-provision exception:", err.message);
  }

  if (!profile) {
    console.error("[OAuth Callback] REJECTED — No profile, senior, or donation found for:", email);
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/${locale}/login?error=not_authorized`
    );
  }

  console.log("[OAuth Callback] ACCEPTED — Redirecting user to:", profile.role);

  const redirectPath =
    profile.role === "applicant"
      ? `/${locale}/my-case`
      : profile.role === "donor"
      ? `/${locale}/donor`
      : `/${locale}/dashboard`;

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
