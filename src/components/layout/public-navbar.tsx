"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/en", label: "Home" },
  { href: "/en/about", label: "About" },
  { href: "/en/programs", label: "Programs" },
  { href: "/en/donate", label: "Donate" },
  { href: "/en/apply", label: "Apply" },
  { href: "/en/contact", label: "Contact" },
];

export function PublicNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/en" className="mr-6 flex items-center space-x-2">
          <span className="text-lg font-bold">InspireHope</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href as never}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === link.href ? "text-foreground" : "text-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/en/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
