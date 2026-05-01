import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  // Test 1: Can we reach Supabase Auth via anon client?
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  // Test 2: Can we read from the database via anon client (tests RLS)?
  const { data: testimonials, error: dbError } = await supabase
    .from("testimonials")
    .select("id", { count: "exact", head: true });

  // Test 3: Can we read profiles via anon client (tests RLS)?
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  // Test 4: Can we read via admin client (bypasses RLS)?
  const { data: adminProfiles, error: adminProfileError } = await supabaseAdmin
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const { data: adminTestimonials, error: adminTestimonialError } = await supabaseAdmin
    .from("testimonials")
    .select("id", { count: "exact", head: true });

  const { data: adminSeniors, error: adminSeniorError } = await supabaseAdmin
    .from("seniors")
    .select("id", { count: "exact", head: true });

  return NextResponse.json({
    ok: !sessionError,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "configured" : "missing",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "configured" : "missing",
    auth: {
      ok: !sessionError,
      error: sessionError?.message ?? null,
      hasSession: !!session,
      userId: session?.user?.id ?? null,
    },
    // Results via anon client (subject to RLS)
    viaAnonClient: {
      testimonials: { ok: !dbError, count: testimonials?.length ?? 0, error: dbError?.message ?? null },
      profiles: { ok: !profileError, count: profiles?.length ?? 0, error: profileError?.message ?? null },
    },
    // Results via service role (bypasses RLS)
    viaAdminClient: {
      profiles: { ok: !adminProfileError, count: adminProfiles?.length ?? 0, error: adminProfileError?.message ?? null },
      testimonials: { ok: !adminTestimonialError, count: adminTestimonials?.length ?? 0, error: adminTestimonialError?.message ?? null },
      seniors: { ok: !adminSeniorError, count: adminSeniors?.length ?? 0, error: adminSeniorError?.message ?? null },
    },
  });
}
