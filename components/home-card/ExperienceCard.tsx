import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  ConciergeBell,
  Car,
  Sparkles,
  KeyRound,
  Map,
  Briefcase,
  CalendarDays,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Experience } from "@/lib/data/types";
import type { AppLocale } from "@/i18n/routing";

const ICON_MAP: Record<string, LucideIcon> = {
  "concierge-bell": ConciergeBell,
  car: Car,
  sparkles: Sparkles,
  "key-round": KeyRound,
  map: Map,
  briefcase: Briefcase,
  "calendar-days": CalendarDays,
  leaf: Leaf,
};

export function ExperienceCard({
  experience,
  className,
}: {
  experience: Experience;
  className?: string;
}) {
  const tCat = useTranslations("experiences.categories");
  const locale = useLocale() as AppLocale;
  const Icon = ICON_MAP[experience.icon] ?? ConciergeBell;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl bg-stone shadow-editorial transition-shadow duration-300 ease-out-expo hover:shadow-editorial-lg",
        className,
      )}
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-navy/5">
        <Image
          src={experience.image}
          alt={experience.title[locale]}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
        />
        <div className="absolute start-4 top-4 inline-flex items-center gap-2 rounded-full bg-stone/90 backdrop-blur px-3 py-1.5 text-[11px] uppercase tracking-eyebrow text-navy">
          <Icon className="h-3.5 w-3.5" />
          {tCat(experience.category)}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-h4-mobile lg:text-h4 leading-tight tracking-tight-heading font-medium">
          {experience.title[locale]}
        </h3>
        <p className="mt-3 text-sm text-navy/75 leading-relaxed text-pretty">
          {experience.description[locale]}
        </p>
      </div>
    </article>
  );
}
