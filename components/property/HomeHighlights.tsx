import { useLocale, useTranslations } from "next-intl";
import {
  Wifi,
  KeyRound,
  Briefcase,
  Sparkles,
  Snowflake,
  Tv,
  Waves,
  Dumbbell,
  Car,
  Trees,
  Eye,
  PawPrint,
  Coffee,
  Shield,
  Award,
} from "lucide-react";
import type { Home } from "@/lib/data/types";
import type { AppLocale } from "@/i18n/routing";

const HIGHLIGHT_ICONS: Record<string, React.ElementType> = {
  smartCheckIn: KeyRound,
  fastWifi: Wifi,
  workspace: Briefcase,
  pool: Waves,
  gym: Dumbbell,
  parking: Car,
  garden: Trees,
  seaView: Eye,
  petFriendly: PawPrint,
  smartHome: Sparkles,
  acComfort: Snowflake,
  tv: Tv,
  coffee: Coffee,
  security: Shield,
  award: Award,
};

export function HomeHighlights({ home }: { home: Home }) {
  const t = useTranslations("homeDetail");
  const locale = useLocale() as AppLocale;
  const items = home.highlights[locale];

  return (
    <section>
      <h3 className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55 mb-5">
        {t("highlights")}
      </h3>
      <ul className="flex flex-wrap gap-2">
        {items.map((highlight, i) => {
          const iconKey = matchIcon(highlight, home);
          const Icon = HIGHLIGHT_ICONS[iconKey] ?? Award;
          return (
            <li
              key={`${highlight}-${i}`}
              className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm text-navy ring-1 ring-navy/8"
            >
              <Icon className="h-4 w-4 text-navy/65" />
              <span>{highlight}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function matchIcon(highlight: string, home: Home): string {
  const lower = highlight.toLowerCase();
  if (lower.includes("check-in") || lower.includes("ذكي")) return "smartCheckIn";
  if (lower.includes("wi-fi") || lower.includes("واي")) return "fastWifi";
  if (lower.includes("workspace") || lower.includes("عمل") || lower.includes("desk") || lower.includes("مكتب")) return "workspace";
  if (lower.includes("pool") || lower.includes("سباحة") || lower.includes("حمّام سباحة")) return "pool";
  if (lower.includes("gym") || lower.includes("جيم")) return "gym";
  if (lower.includes("parking") || lower.includes("موقف")) return "parking";
  if (lower.includes("garden") || lower.includes("حديقة")) return "garden";
  if (lower.includes("sea") || lower.includes("بحر")) return "seaView";
  if (lower.includes("pet") || lower.includes("حيوان")) return "petFriendly";
  if (home.amenities.includes("smartLock")) return "smartHome";
  return "award";
}
