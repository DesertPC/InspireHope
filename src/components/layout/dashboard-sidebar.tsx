"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/en/dashboard", label: "Dashboard" },
  { href: "/en/dashboard/seniors", label: "Seniors" },
  { href: "/en/dashboard/cases", label: "Cases" },
  { href: "/en/dashboard/donations", label: "Donations" },
  { href: "/en/dashboard/expenses", label: "Expenses" },
  { href: "/en/dashboard/reports", label: "Reports" },
  { href: "/en/dashboard/settings", label: "Settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/en/dashboard" className="text-lg font-bold">
            InspireHope
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href as never}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
