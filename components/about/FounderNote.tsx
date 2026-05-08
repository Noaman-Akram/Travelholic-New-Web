import Image from "next/image";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";

export function FounderNote() {
  const t = useTranslations("about.founder");
  return (
    <section className="relative bg-stone-100 py-20 lg:py-32">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-12 gap-8 lg:gap-16 items-center">
          <Reveal className="col-span-12 lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-navy/10 max-w-md">
              {/* REVIEW: founder portrait — picsum placeholder */}
              <Image
                src="https://picsum.photos/seed/th-founder/800/1000"
                alt={t("name")}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal className="col-span-12 lg:col-span-7" delay={0.05}>
            <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
              {t("eyebrow")}
            </p>
            <blockquote className="mt-6">
              <p className="text-h3-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
                <span className="text-butter font-artistic italic me-1">“</span>
                {t("quote")}
                <span className="text-butter font-artistic italic ms-1">”</span>
              </p>
              <footer className="mt-8 flex items-baseline gap-3">
                <span className="font-artistic italic text-h4-mobile lg:text-h4 text-navy">
                  {t("signature")}
                </span>
                <span className="text-sm text-navy/55">
                  {t("name")} · {t("role")}
                </span>
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
