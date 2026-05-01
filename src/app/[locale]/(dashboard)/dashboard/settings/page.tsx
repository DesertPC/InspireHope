import { requireAuth } from "@/lib/supabase/auth-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bootstrapAdmins } from "@/actions/bootstrap.actions";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { user, profile } = await requireAuth(locale);

  const isAdmin = profile?.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Account and system settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-mono text-sm">{user.id || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <Badge>{profile?.role ?? "—"}</Badge>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Bootstrap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Run this once to set up real admin accounts and remove the fake admin user.
            </p>
            <form action={bootstrapAdmins}>
              <Button type="submit" variant="outline">
                Run Admin Bootstrap
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
