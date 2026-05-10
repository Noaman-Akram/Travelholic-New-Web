import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertCircle } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { KeyholeMark } from "@/components/brand/KeyholeMark";

type Props = { params: Promise<{ locale: AppLocale }> };

export const metadata: Metadata = {
  title: "Booking cancelled",
  robots: { index: false, follow: false },
};

export default async function BookingCancelledPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "bookingResult.cancelled" });

  return (
    <main className="min-h-[80vh] bg-stone py-24 lg:py-32">
      <div className="mx-auto max-w-screen-md px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <KeyholeMark tone="navy" className="h-14 w-14 mb-8" />
          <AlertCircle className="h-12 w-12 text-navy/55 mb-6" />
          <h1 className="text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium mb-4">
            {t("title")}
          </h1>
          <p className="text-body-lg text-navy/70 max-w-md mb-10 text-pretty">{t("body")}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href="/homes">{t("tryAgain")}</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/contact">{t("contact")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
