import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { FAQAccordion } from "@/components/property/FAQAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusiness, faqPage } from "@/lib/seo/jsonLd";

type Props = { params: Promise<{ locale: AppLocale }> };

type FAQItem = { q: string; a: string };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const tFaq = await getTranslations("home.faq");
  const items = (tFaq.raw("items") as unknown as FAQItem[])?.slice(0, 4) ?? [];

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : undefined;

  const channels = [
    {
      icon: MessageCircle,
      label: t("channels.whatsappLabel"),
      note: t("channels.whatsappNote"),
      href: whatsappHref,
      disabled: !whatsappHref,
    },
    {
      icon: Phone,
      label: t("channels.phoneLabel"),
      note: t("channels.phoneNote"),
      href: "tel:+201000000000",
      disabled: false,
    },
    {
      icon: Mail,
      label: t("channels.emailLabel"),
      note: t("channels.emailNote"),
      href: "mailto:hello@travelholic.example",
      disabled: false,
    },
  ];

  return (
    <>
      <JsonLd data={[localBusiness(locale), faqPage(items)]} />
      <section className="bg-stone pt-12 lg:pt-20 pb-10">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
          <Reveal as="header" className="max-w-4xl">
            <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
              {t("heroEyebrow")}
            </p>
            <h1 className="mt-6 text-h1-mobile lg:text-h1 font-medium tracking-tight-heading leading-tight text-balance">
              {t("heroHeadline")}
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg leading-relaxed text-navy/75 text-pretty">
              {t("heroSubline")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-stone pb-20 lg:pb-28">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-12 gap-8 lg:gap-16">
            {/* Form */}
            <Reveal className="col-span-12 lg:col-span-7">
              <div className="rounded-3xl bg-stone-100 ring-1 ring-navy/10 p-8 lg:p-12">
                <ContactForm />
              </div>
            </Reveal>

            {/* Channels + map */}
            <Reveal className="col-span-12 lg:col-span-5 flex flex-col gap-8">
              <div className="rounded-3xl bg-stone-100 ring-1 ring-navy/10 p-8">
                <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55 mb-6">
                  {t("channels.title")}
                </p>
                <ul className="space-y-5">
                  {channels.map((c) => {
                    const Icon = c.icon;
                    const inner = (
                      <span className="flex items-start gap-4">
                        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-stone">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-base font-medium text-navy">{c.label}</span>
                          <span className="text-xs text-navy/55">{c.note}</span>
                        </span>
                      </span>
                    );
                    return (
                      <li key={c.label}>
                        {c.disabled ? (
                          <span className="opacity-60">{inner}</span>
                        ) : (
                          <a
                            href={c.href}
                            target={c.label === t("channels.whatsappLabel") ? "_blank" : undefined}
                            rel={c.label === t("channels.whatsappLabel") ? "noopener noreferrer" : undefined}
                            className="block hover:opacity-70 transition-opacity"
                          >
                            {inner}
                          </a>
                        )}
                      </li>
                    );
                  })}
                  <li>
                    <span className="flex items-start gap-4">
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-stone">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-base font-medium text-navy">
                          {t("channels.addressLabel")}
                        </span>
                        <span className="text-xs text-navy/55 leading-relaxed">
                          {t("channels.addressLine1")}
                          <br />
                          {t("channels.addressLine2")}
                        </span>
                      </span>
                    </span>
                  </li>
                </ul>
              </div>

              <div className="relative aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden ring-1 ring-navy/10 bg-stone-200">
                {/* Embedded OSM tile of Lotus / New Cairo (no API key) */}
                <iframe
                  title="Travelholic — Lotus, New Cairo"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=31.43%2C30.00%2C31.47%2C30.03&layer=mapnik&marker=30.0153%2C31.4501"
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-stone-100 py-20 lg:py-28">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-12 gap-8 lg:gap-16">
            <Reveal as="header" className="col-span-12 lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
              <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
                FAQ
              </p>
              <h2 className="mt-3 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
                {t("faqTitle")}
              </h2>
            </Reveal>

            <Reveal className="col-span-12 lg:col-span-8">
              <FAQAccordion items={items} />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
