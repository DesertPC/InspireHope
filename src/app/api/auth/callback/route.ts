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

  // Verify the user exists in profiles — reject unauthorized users
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user?.email) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=auth_callback_failed&details=no_user`);
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("email", user.email)
    .maybeSingle();

  if (!profile) {
    // User authenticated with Google but is NOT pre-authorized in profiles
    // Sign them out immediately and redirect to login with error
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/${locale}/login?error=not_authorized`
    );
  }

  // Redirect based on the role stored in profiles (not the button clicked)
  const redirectPath =
    profile.role === "applicant"
      ? `/${locale}/my-case`
      : `/${locale}/dashboard`;

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
