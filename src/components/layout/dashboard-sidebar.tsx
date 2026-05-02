"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useTranslations } from "next-intl";

const allRoutes = [
  { path: "/dashboard", key: "dashboard", roles: ["admin", "volunteer"] },
  { path: "/dashboard/seniors", key: "seniors", roles: ["admin", "volunteer"] },
  { path: "/dashboard/cases", key: "cases", roles: ["admin", "volunteer"] },
  { path: "/dashboard/testimonials", key: "testimonials", roles: ["admin", "volunteer"] },
  { path: "/dashboard/donations", key: "donations", roles: ["admin"] },
  { path: "/dashboard/expenses", key: "expenses", roles: ["admin", "volunteer"] },
  { path: "/dashboard/users", key: "users", roles: ["admin"] },
  { path: "/dashboard/reports", key: "reports", roles: ["admin", "volunteer"] },
  { path: "/dashboard/settings", key: "settings", roles: ["admin", "volunteer"] },
];

interface DashboardSidebarProps {
  role?: string;
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] ?? "en";
  const t = useTranslations("dashboard");

  const routes = allRoutes.filter((r) => r.roles.includes(role ?? ""));

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
          {routes.map((link) => {
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
