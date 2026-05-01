"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useTranslations } from "next-intl";

const routePaths = [
  { path: "/dashboard", key: "dashboard" },
  { path: "/dashboard/seniors", key: "seniors" },
  { path: "/dashboard/cases", key: "cases" },
  { path: "/dashboard/donations", key: "donations" },
  { path: "/dashboard/expenses", key: "expenses" },
  { path: "/dashboard/users", key: "users" },
  { path: "/dashboard/reports", key: "reports" },
  { path: "/dashboard/settings", key: "settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] ?? "en";
  const t = useTranslations("dashboard");

  return (
    <aside className="w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4 justify-between">
          <Link href={`/${locale}`} className="text-lg font-bold">
            InspireHope
          </Link>
          <LocaleSwitcher />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {routePaths.map((link) => {
            const href = `/${locale}${link.path}`;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {t(`sidebar.${link.key}`)}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full">
              {t("sidebar.signOut")}
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
