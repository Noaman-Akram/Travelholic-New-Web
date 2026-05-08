"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

export function LocaleSwitch({
  className,
  variant = "compact",
}: {
  className?: string;
  variant?: "compact" | "block";
}) {
  const t = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const target: AppLocale = locale === "en" ? "ar" : "en";
  const label = locale === "en" ? t("switchToArabic") : t("switchToEnglish");

  function handleClick() {
    startTransition(() => {
      router.replace(pathname, { locale: target });
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-eyebrow",
        "border border-navy/20 bg-transparent text-navy hover:bg-navy/5",
        "transition-colors duration-200 ease-out-expo",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-stone",
        variant === "block" && "w-full px-4 py-2 text-sm",
        className,
      )}
      aria-label={label}
    >
      {label}
    </button>
  );
}
