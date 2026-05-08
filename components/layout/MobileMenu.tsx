"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LocaleSwitch } from "./LocaleSwitch";
import { CurrencySwitch } from "./CurrencySwitch";
import { Logo } from "@/components/brand/Logo";

const NAV_ITEMS = [
  { href: "/homes", key: "homes" as const },
  { href: "/destinations", key: "destinations" as const },
  { href: "/experiences", key: "experiences" as const },
  { href: "/stories", key: "stories" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
];

export function MobileMenu({ locale }: { locale: "en" | "ar" }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t("menuLabel")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="end"
        className="flex flex-col gap-8 bg-stone w-full sm:max-w-md"
      >
        <SheetTitle className="sr-only">{t("menuLabel")}</SheetTitle>

        <div className="pt-4">
          <Logo locale={locale} size="md" />
        </div>

        <nav className="flex flex-col gap-1 mt-2">
          {NAV_ITEMS.map((item) => (
            <SheetClose asChild key={item.key}>
              <Link
                href={item.href}
                className="block py-3 text-2xl font-medium text-navy border-b border-navy/10 hover:text-navy/80 transition-colors"
              >
                {t(item.key)}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <SheetClose asChild>
            <Button asChild variant="primary" size="lg" className="w-full">
              <Link href="/homes">{t("book")}</Link>
            </Button>
          </SheetClose>
          <div className="flex gap-2 mt-2">
            <LocaleSwitch className="flex-1" variant="block" />
            <CurrencySwitch className="flex-1" variant="block" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
