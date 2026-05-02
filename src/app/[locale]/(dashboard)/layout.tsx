import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  let role = "";
  if (session?.user) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();
    role = profile?.role ?? "";
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role={role} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
