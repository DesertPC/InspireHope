import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  // Test 1: Can we reach Supabase Auth?
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  // Test 2: Count rows via admin client (bypasses RLS)
  const adminCounts: Record<string, number | null> = {};
  const tables = ["seniors", "testimonials", "profiles", "cases", "donations", "expenses"];

  for (const table of tables) {
    const { count, error } = await supabaseAdmin
      .from(table)
      .select("*", { count: "exact", head: true });
    adminCounts[table] = error ? null : count;
  }

  // Test 3: Can anon client read approved testimonials?
  const { data: publicTestimonials, error: publicError } = await supabase
    .from("testimonials")
    .select("id, name, status")
    .eq("status", "approved")
    .limit(5);

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
    adminCounts,
    publicTestimonials: {
      count: publicTestimonials?.length ?? 0,
      error: publicError?.message ?? null,
      sample: publicTestimonials ?? [],
    },
  });
}
