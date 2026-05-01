import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/supabase/auth-helpers";

export default async function DashboardAuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { profile } = await requireAuth(locale);

  // Applicants should not access the staff dashboard
  if (profile?.role === "applicant") {
    redirect(`/${locale}/my-case`);
  }

  // Only admins and volunteers can access the dashboard
  if (!profile || (profile.role !== "admin" && profile.role !== "volunteer")) {
    redirect(`/${locale}/login?error=unauthorized`);
  }

  return <>{children}</>;
}
