import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  // Test 1: Can we reach Supabase Auth?
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  // Test 2: Can we read from the database (testimonials table)?
  const { data: testimonials, error: dbError } = await supabase
    .from("testimonials")
    .select("id", { count: "exact", head: true });

  // Test 3: Can we read from profiles (this checks RLS / admin access)?
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  return NextResponse.json({
    ok: !sessionError && !dbError,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "configured" : "missing",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "configured" : "missing",
    auth: {
      ok: !sessionError,
      error: sessionError?.message ?? null,
      hasSession: !!session,
    },
    database: {
      ok: !dbError,
      error: dbError?.message ?? null,
      testimonialsCount: testimonials?.length ?? 0,
    },
    profiles: {
      ok: !profileError,
      error: profileError?.message ?? null,
      profilesCount: profiles?.length ?? 0,
    },
  });
}
