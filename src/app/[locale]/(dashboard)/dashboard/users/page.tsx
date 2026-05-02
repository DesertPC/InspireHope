import { getTranslations } from "next-intl/server";
import { getUsers, createUser } from "@/actions/users.actions";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);
  const users = await getUsers();
  const t = await getTranslations("dashboard.pages.users");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("createUser")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createUser}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end"
          >
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">{t("fullName")}</Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t("role")}</Label>
              <select
                id="role"
                name="role"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="volunteer">{t("volunteer")}</option>
                <option value="admin">{t("admin")}</option>
              </select>
            </div>
            <div className="md:col-span-4">
              <Button type="submit">{t("create")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("allUsers")} ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("fullName")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.full_name || "—"}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === "admin" ? "default" : "secondary"}
                    >
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.is_active ? "outline" : "destructive"}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    {t("noUsers")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
