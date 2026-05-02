"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { updateUserLocale } from "@/actions/auth.actions";

const locales = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇲🇽" },
];

export function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname?.split("/")[1] ?? "en";

  function switchLocale(nextLocale: string) {
    if (!pathname) return;

    // Persist locale in cookie for next-intl middleware
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000`;

    // Persist locale in user profile (best effort)
    updateUserLocale(nextLocale).catch(() => {
      // Ignore errors — user may not be logged in
    });

    const newPath = pathname.replace(/^\/(en|es)/, `/${nextLocale}`);
    router.push(newPath);
  }

  const active = locales.find((l) => l.code === currentLocale) ?? locales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="uppercase text-xs font-semibold">{active.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => switchLocale(locale.code)}
            className={locale.code === currentLocale ? "font-semibold bg-accent" : ""}
          >
            <span className="mr-2">{locale.flag}</span>
            {locale.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
