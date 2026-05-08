"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Wifi,
  KeyRound,
  Briefcase,
  ChefHat,
  Snowflake,
  Tv,
  WashingMachine,
  Wind,
  Waves,
  Dumbbell,
  Car,
  TreePine,
  Eye,
  PawPrint,
  ArrowUpDown,
  Shield,
  Sparkles,
  Bed,
  Coffee,
  Shirt,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AmenityKey, Home } from "@/lib/data/types";

const ICON_MAP: Record<AmenityKey, React.ElementType> = {
  wifi: Wifi,
  smartLock: KeyRound,
  workspace: Briefcase,
  kitchen: ChefHat,
  ac: Snowflake,
  tv: Tv,
  washer: WashingMachine,
  dryer: Wind,
  pool: Waves,
  gym: Dumbbell,
  parking: Car,
  balcony: TreePine,
  seaView: Eye,
  petFriendly: PawPrint,
  elevator: ArrowUpDown,
  security: Shield,
  cleaningService: Sparkles,
  linens: Bed,
  coffee: Coffee,
  iron: Shirt,
};

const CATEGORY_MAP: Record<AmenityKey, string> = {
  wifi: "essentials",
  ac: "essentials",
  tv: "essentials",
  linens: "essentials",
  iron: "essentials",
  cleaningService: "essentials",
  kitchen: "kitchen",
  coffee: "kitchen",
  washer: "kitchen",
  dryer: "kitchen",
  workspace: "comfort",
  balcony: "comfort",
  seaView: "comfort",
  pool: "comfort",
  gym: "comfort",
  petFriendly: "comfort",
  smartLock: "smart",
  security: "safety",
  elevator: "safety",
  parking: "safety",
};

const PREVIEW_LIMIT = 10;

export function HomeAmenitiesGrid({ home }: { home: Home }) {
  const t = useTranslations("homeDetail.amenities");
  const tLabels = useTranslations("homeDetail.amenityLabels");
  const tCategories = useTranslations("homeDetail.amenities.categories");
  const [open, setOpen] = useState(false);

  const visible = home.amenities.slice(0, PREVIEW_LIMIT);
  const hasMore = home.amenities.length > PREVIEW_LIMIT;

  const grouped = home.amenities.reduce<Record<string, AmenityKey[]>>((acc, key) => {
    const cat = CATEGORY_MAP[key] ?? "essentials";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(key);
    return acc;
  }, {});

  return (
    <section>
      <h3 className="text-h3-mobile lg:text-h3 leading-tight tracking-tight-heading font-medium mb-8">
        {t("title")}
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
        {visible.map((key) => {
          const Icon = ICON_MAP[key];
          return (
            <li key={key} className="flex items-center gap-4 py-2">
              <Icon className="h-5 w-5 text-navy/70 shrink-0" />
              <span className="text-sm text-navy/85">{tLabels(key)}</span>
            </li>
          );
        })}
      </ul>

      {hasMore ? (
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button variant="ghost" size="md" className="mt-6">
              {t("showAll")} ({home.amenities.length})
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 sm:m-auto h-[88svh] sm:h-auto sm:max-h-[80vh] w-full sm:max-w-2xl sm:rounded-3xl bg-stone shadow-editorial-lg overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom">
              <header className="flex items-center justify-between p-5 sm:p-7 border-b border-navy/10">
                <Dialog.Title className="text-h4 font-medium">
                  {t("dialogTitle")}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Close"
                    className="grid h-10 w-10 place-items-center rounded-full hover:bg-navy/5 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </header>
              <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-8">
                {Object.entries(grouped).map(([cat, keys]) => (
                  <div key={cat}>
                    <h4 className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55 mb-3">
                      {tCategories(cat as "essentials")}
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                      {keys.map((key) => {
                        const Icon = ICON_MAP[key];
                        return (
                          <li key={key} className="flex items-center gap-3 text-sm text-navy/85">
                            <Icon className="h-5 w-5 text-navy/70 shrink-0" />
                            <span>{tLabels(key)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ) : null}
    </section>
  );
}
