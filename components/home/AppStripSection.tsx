import { useTranslations } from "next-intl";
import { Apple, Smartphone, Check } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PhoneMockup } from "./PhoneMockup";

export function AppStripSection() {
  const t = useTranslations("home.appSection");
  const capabilities = (t.raw("capabilities") as unknown as string[]) ?? [];

  return (
    <section className="relative bg-stone-100 py-24 lg:py-36 overflow-hidden">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-12 gap-8 items-center">
          <Reveal className="col-span-12 lg:col-span-7" variant="fade-up">
            <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
              {t("eyebrow")}
            </p>
            <h2 className="mt-3 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance max-w-2xl">
              {t("title")}
            </h2>
            <p className="mt-5 max-w-xl text-body-lg leading-relaxed text-navy/75 text-pretty">
              {t("body")}
            </p>

            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              {capabilities.map((cap) => (
                <li key={cap} className="flex items-start gap-3">
                  <span className="mt-1 grid h-5 w-5 place-items-center rounded-full bg-butter">
                    <Check className="h-3 w-3 text-navy" />
                  </span>
                  <span className="text-sm text-navy/85">{cap}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <span
                role="button"
                aria-disabled="true"
                tabIndex={-1}
                className="inline-flex items-center gap-3 rounded-2xl bg-navy text-stone px-5 py-3 opacity-80 cursor-not-allowed select-none"
              >
                <Apple className="h-6 w-6" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] uppercase tracking-eyebrow text-stone/60">
                    {t("comingSoon")}
                  </span>
                  <span className="text-sm font-medium">{t("appStore")}</span>
                </span>
              </span>
              <span
                role="button"
                aria-disabled="true"
                tabIndex={-1}
                className="inline-flex items-center gap-3 rounded-2xl bg-navy text-stone px-5 py-3 opacity-80 cursor-not-allowed select-none"
              >
                <Smartphone className="h-6 w-6" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] uppercase tracking-eyebrow text-stone/60">
                    {t("comingSoon")}
                  </span>
                  <span className="text-sm font-medium">{t("playStore")}</span>
                </span>
              </span>
              <Button asChild variant="ghost" size="md" className="ms-auto">
                <Link href="/app">{t("learnMore")}</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal className="col-span-12 lg:col-span-5 relative" variant="fade-up">
            <div className="relative mx-auto w-full max-w-[420px] aspect-[4/5]">
              <div className="absolute start-0 top-[6%] w-[55%] rotate-[-6deg] z-0">
                <PhoneMockup
                  screen="https://picsum.photos/seed/th-app-strip-a/440/880"
                  alt="App"
                  tone="navy"
                />
              </div>
              <div className="absolute end-0 top-[18%] w-[55%] rotate-[5deg] z-10">
                <PhoneMockup
                  screen="https://picsum.photos/seed/th-app-strip-b/440/880"
                  alt="App"
                  tone="navy"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
