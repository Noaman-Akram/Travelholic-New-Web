import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/Logo";
import { LocaleSwitch } from "./LocaleSwitch";
import { CurrencySwitch } from "./CurrencySwitch";
import { FooterNewsletter } from "./FooterNewsletter";

export function Footer({ locale }: { locale: "en" | "ar" }) {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t("columns.homes"),
      links: [
        { href: "/homes", label: t("links.allHomes") },
        { href: "/destinations/lotus", label: t("links.lotus"), areaLabel: t("links.newCairoLabel") },
        { href: "/destinations/auc", label: t("links.auc"), areaLabel: t("links.newCairoLabel") },
        { href: "/destinations/near-cfc", label: t("links.nearCfc"), areaLabel: t("links.newCairoLabel") },
        { href: "/destinations/ninetieth-street", label: t("links.ninetiethStreet"), areaLabel: t("links.newCairoLabel") },
        { href: "/destinations/gg-buildings", label: t("links.ggBuildings"), areaLabel: t("links.goldenGatesLabel") },
        { href: "/destinations/gg-villas", label: t("links.ggVillas"), areaLabel: t("links.goldenGatesLabel") },
        { href: "/destinations/nomads", label: t("links.nomads"), areaLabel: t("links.goldenGatesLabel") },
      ],
    },
    {
      title: t("columns.company"),
      links: [
        { href: "/about", label: t("links.about") },
        { href: "/about", label: t("links.careers") },
        { href: "/about", label: t("links.press") },
      ],
    },
    {
      title: t("columns.help"),
      links: [
        { href: "/contact", label: t("links.contact") },
        { href: "/contact", label: t("links.faq") },
        { href: "/app", label: t("links.smartCheckIn") },
      ],
    },
    {
      title: t("columns.legal"),
      links: [
        { href: "/privacy", label: t("links.privacy") },
        { href: "/terms", label: t("links.terms") },
        { href: "/privacy", label: t("links.cookies") },
      ],
    },
  ];

  return (
    <footer className="bg-stone-200 text-navy">
      {/* Top: brand + newsletter */}
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10 pt-20 pb-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          <div>
            <Logo locale={locale} size="lg" />
            <p className="mt-4 max-w-md text-h4 lg:text-h3 leading-tight tracking-tight-heading text-pretty">
              {t("tagline")}
            </p>
          </div>

          <FooterNewsletter />
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <div className="h-px bg-navy/15" />
      </div>

      {/* Columns */}
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10 py-12 grid grid-cols-2 lg:grid-cols-4 gap-10">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/60">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={`${col.title}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="block text-sm text-navy/80 hover:text-navy transition-colors leading-tight"
                  >
                    {link.label}
                    {"areaLabel" in link && link.areaLabel ? (
                      <span className="block text-[10px] uppercase tracking-eyebrow text-navy/40 mt-0.5">
                        {link.areaLabel}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom strip */}
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10 pb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-navy/10">
          <p className="text-xs text-navy/60">
            {t("rights", { year })}
          </p>
          <div className="flex gap-2">
            <LocaleSwitch />
            <CurrencySwitch />
            <Link
              href="/contact"
              className="rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-eyebrow border border-navy/20 hover:bg-navy/5"
            >
              {tNav("contact")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
