"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils/cn";

// REVIEW: team photos — picsum placeholders
const TEAM = [
  { name: "Rashad R.", role: "Founder" },
  { name: "Yasmin A.", role: "Head of Hospitality" },
  { name: "Ahmed M.", role: "Operations Lead" },
  { name: "Salma E.", role: "Concierge" },
  { name: "Tarek H.", role: "Concierge" },
  { name: "Nada K.", role: "Smart-home Tech" },
  { name: "Omar S.", role: "Maintenance Lead" },
  { name: "Hala R.", role: "Long-stay Manager" },
  { name: "Mariam F.", role: "Housekeeping Lead" },
  { name: "Karim B.", role: "Driver / Airport" },
  { name: "Lina T.", role: "Marketing" },
  { name: "Adel N.", role: "Finance" },
];

const roleLocaleMap: Record<string, { en: string; ar: string }> = {
  Founder: { en: "Founder", ar: "المؤسّس" },
  "Head of Hospitality": { en: "Head of Hospitality", ar: "رئيسة الضيافة" },
  "Operations Lead": { en: "Operations Lead", ar: "قائد العمليات" },
  Concierge: { en: "Concierge", ar: "كونسيرج" },
  "Smart-home Tech": { en: "Smart-home Tech", ar: "تقنية البيت الذكي" },
  "Maintenance Lead": { en: "Maintenance Lead", ar: "قائد الصيانة" },
  "Long-stay Manager": { en: "Long-stay Manager", ar: "مدير الإقامات الطويلة" },
  "Housekeeping Lead": { en: "Housekeeping Lead", ar: "قائدة التنظيف" },
  "Driver / Airport": { en: "Driver · Airport", ar: "سائق · مطار" },
  Marketing: { en: "Marketing", ar: "تسويق" },
  Finance: { en: "Finance", ar: "محاسبة" },
};

export function TeamGrid({ locale }: { locale: "en" | "ar" }) {
  const t = useTranslations("about.team");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="relative bg-stone py-20 lg:py-32">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal as="header" className="mb-12 lg:mb-16 max-w-3xl">
          <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-2xl text-body-lg leading-relaxed text-navy/70 text-pretty">
            {t("subtitle")}
          </p>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
          {TEAM.map((person, i) => {
            const role = roleLocaleMap[person.role]?.[locale] ?? person.role;
            return (
              <Reveal key={person.name} delay={i * 0.03}>
                <article
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-navy/10"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <Image
                    src={`https://picsum.photos/seed/th-team-${i}/600/750`}
                    alt={person.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105"
                  />
                  <div
                    className={cn(
                      "absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent text-stone transition-opacity duration-300 ease-out-expo",
                      activeIndex === i ? "opacity-100" : "opacity-90",
                    )}
                  >
                    <p className="text-sm font-medium leading-tight">{person.name}</p>
                    <p
                      className={cn(
                        "text-[11px] uppercase tracking-eyebrow text-stone/80 mt-1 transition-all duration-300",
                        activeIndex === i ? "opacity-100 max-h-12" : "opacity-0 max-h-0",
                      )}
                    >
                      {role}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
