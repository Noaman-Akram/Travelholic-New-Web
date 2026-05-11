import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { ViewTransitions } from "next-view-transitions";
import "@/app/globals.css";
import { routing, type AppLocale } from "@/i18n/routing";
import { CurrencyProvider, CURRENCY_COOKIE } from "@/lib/currency/context";
import type { AppCurrency } from "@/lib/utils/formatPrice";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { Analytics } from "@/components/analytics/Analytics";
import { Preloader } from "@/components/layout/Preloader";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const interAccent = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-accent",
  weight: ["500", "600"],
});

const myriadArabic = localFont({
  src: [{ path: "../../public/fonts/MyriadArabic-Regular.otf", weight: "400" }],
  display: "swap",
  variable: "--font-arabic",
  fallback: ["Noto Naskh Arabic", "Tahoma", "sans-serif"],
});

// Inter stands in for the artistic font in Phase 1; Phase 2 may introduce a script font.
const interArtistic = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-artistic",
  weight: ["400"],
  style: ["italic"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "home" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return {
    title: {
      default: t("metaTitle"),
      template: `%s · ${tCommon("brand")}`,
    },
    description: t("metaDescription"),
    applicationName: tCommon("brand"),
    keywords:
      locale === "ar"
        ? [
            "تراڤل هوليك",
            "حجز مباشر",
            "شقق فندقية القاهرة",
            "سعر أقل من المنصات",
            "بيوت لا غرف",
          ]
        : [
            "Travelholic",
            "book direct Cairo",
            "lower direct rates",
            "serviced apartments Cairo",
            "Homes Not Rooms",
          ],
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ar: "/ar",
        "x-default": "/en",
      },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
      locale: locale === "ar" ? "ar_EG" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enable static rendering of the layout
  setRequestLocale(locale);

  const messages = await getMessages();

  // Read currency cookie on server, hydrate to context
  const cookieStore = await cookies();
  const currencyCookie = cookieStore.get(CURRENCY_COOKIE)?.value;
  const initialCurrency: AppCurrency =
    currencyCookie === "USD" ? "USD" : "EGP";

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <ViewTransitions>
      <html
        lang={locale}
        dir={dir}
        className={`${inter.variable} ${interAccent.variable} ${interArtistic.variable} ${myriadArabic.variable}`}
      >
        <body className="min-h-screen flex flex-col bg-stone text-navy antialiased">
          <NextIntlClientProvider locale={locale} messages={messages}>
            <CurrencyProvider initial={initialCurrency}>
              <Preloader locale={locale as AppLocale} />
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:bg-navy focus:text-stone focus:px-4 focus:py-2 focus:rounded-full"
              >
                {messages.common && (messages.common as { skipToContent: string }).skipToContent}
              </a>
              <Navbar locale={locale as AppLocale} />
              <main id="main" className="flex-1 pt-16 lg:pt-20">
                {children}
              </main>
              <Footer locale={locale as AppLocale} />
              <WhatsAppFab />
              <CookieConsent />
              <Analytics />
            </CurrencyProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
