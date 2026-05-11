"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { LocaleSwitch } from "./LocaleSwitch";
import { CurrencySwitch } from "./CurrencySwitch";
import { MobileMenu } from "./MobileMenu";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/homes", key: "homes" as const },
  { href: "/destinations", key: "destinations" as const },
  { href: "/experiences", key: "experiences" as const },
  { href: "/stories", key: "stories" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
];

export function Navbar({ locale }: { locale: "en" | "ar" }) {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handle() {
      setScrolled(window.scrollY > 16);
    }
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-colors duration-300 ease-out-expo",
        scrolled
          ? "bg-stone/95 backdrop-blur-md border-b border-navy/10 shadow-[0_2px_24px_-12px_rgba(0,39,62,0.18)]"
          : "bg-stone/70 backdrop-blur-sm border-b border-navy/[0.06]",
      )}
    >
      <div className="mx-auto flex h-16 lg:h-20 max-w-screen-2xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-8 xl:px-10">
        <Link
          href="/"
          aria-label="Travelholic — home"
          className="inline-flex items-center"
        >
          <Logo locale={locale} size="md" />
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm font-medium text-navy/80 hover:text-navy transition-colors duration-200"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2">
            <LocaleSwitch />
            <CurrencySwitch />
          </div>
          <Button asChild variant="primary" size="sm" className="hidden sm:inline-flex">
            <Link href="/homes">{t("book")}</Link>
          </Button>
          <div className="lg:hidden">
            <MobileMenu locale={locale} />
          </div>
        </div>
      </div>
    </header>
  );
}
