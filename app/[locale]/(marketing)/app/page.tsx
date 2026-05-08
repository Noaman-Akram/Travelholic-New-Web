import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Apple, Smartphone, Check } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { Reveal } from "@/components/motion/Reveal";
import { PhoneMockup } from "@/components/home/PhoneMockup";
import { FAQAccordion } from "@/components/property/FAQAccordion";

type Props = { params: Promise<{ locale: AppLocale }> };
type Capability = { title: string; body: string };
type FAQItem = { q: string; a: string };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "appPage" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function AppLandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("appPage");
  const tFaq = await getTranslations("home.faq");
  const capabilities = (t.raw("capabilities.items") as unknown as Capability[]) ?? [];
  // Use the smart-check-in + remote-work FAQs from the home FAQ for the app page
  const faqItems = (tFaq.raw("items") as unknown as FAQItem[]).slice(6, 8);

  return (
    <>
      <section className="relative bg-navy text-stone py-20 lg:py-32 overflow-hidden">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-12 gap-10 items-center">
            <Reveal className="col-span-12 lg:col-span-7" variant="fade-up">
              <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-butter">
                {t("heroEyebrow")}
              </p>
              <h1 className="mt-6 text-display-mobile lg:text-display font-medium tracking-tight-display leading-[1.05] text-balance">
                {t("heroHeadline")}
              </h1>
              <p className="mt-8 max-w-xl text-body-lg lg:text-h4-mobile leading-relaxed text-stone/85 text-pretty">
                {t("heroSubline")}
              </p>
              <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-butter/15 ring-1 ring-butter/40 px-4 py-1.5 text-xs uppercase tracking-eyebrow text-butter">
                {t("comingSoon")}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <span className="inline-flex items-center gap-3 rounded-2xl bg-stone/10 ring-1 ring-stone/20 text-stone px-5 py-3 opacity-80 cursor-not-allowed">
                  <Apple className="h-6 w-6" />
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] uppercase tracking-eyebrow text-stone/60">
                      {t("stores.notReady")}
                    </span>
                    <span className="text-sm font-medium">{t("stores.appStore")}</span>
                  </span>
                </span>
                <span className="inline-flex items-center gap-3 rounded-2xl bg-stone/10 ring-1 ring-stone/20 text-stone px-5 py-3 opacity-80 cursor-not-allowed">
                  <Smartphone className="h-6 w-6" />
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] uppercase tracking-eyebrow text-stone/60">
                      {t("stores.notReady")}
                    </span>
                    <span className="text-sm font-medium">{t("stores.playStore")}</span>
                  </span>
                </span>
              </div>
            </Reveal>

            <Reveal className="col-span-12 lg:col-span-5" variant="fade-up">
              <div className="relative mx-auto w-full max-w-[460px] aspect-[4/5]">
                <div className="absolute start-0 top-[6%] w-[55%] rotate-[-7deg] z-0">
                  <PhoneMockup
                    screen="https://picsum.photos/seed/th-applanding-a/440/880"
                    alt="App"
                    tone="navy"
                  />
                </div>
                <div className="absolute end-0 top-[20%] w-[55%] rotate-[5deg] z-10">
                  <PhoneMockup
                    screen="https://picsum.photos/seed/th-applanding-b/440/880"
                    alt="App"
                    tone="navy"
                  />
                </div>
                <div className="absolute start-[10%] top-[60%] w-[55%] rotate-[-3deg] z-0">
                  <PhoneMockup
                    screen="https://picsum.photos/seed/th-applanding-c/440/880"
                    alt="App"
                    tone="navy"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-stone py-20 lg:py-32">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
          <Reveal as="header" className="mb-12 lg:mb-16 max-w-2xl">
            <h2 className="text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
              {t("capabilities.title")}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-10 lg:gap-x-16">
            {capabilities.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.04}>
                <article>
                  <span className="mb-5 grid h-10 w-10 place-items-center rounded-full bg-butter">
                    <Check className="h-5 w-5 text-navy" />
                  </span>
                  <h3 className="text-h4-mobile lg:text-h4 leading-tight font-medium tracking-tight-heading">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-body leading-relaxed text-navy/75 text-pretty">
                    {c.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-100 py-20 lg:py-28">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-12 gap-8 lg:gap-16">
            <Reveal as="header" className="col-span-12 lg:col-span-4">
              <h2 className="text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
                {t("faqTitle")}
              </h2>
            </Reveal>
            <Reveal className="col-span-12 lg:col-span-8">
              <FAQAccordion items={faqItems} />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
