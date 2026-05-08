import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";

// REVIEW: real partner logos required — these are typographic placeholders
const PLACEHOLDER_PARTNERS: { en: string; ar: string }[] = [
  { en: "Hassan Allam", ar: "حسن علام" },
  { en: "SODIC", ar: "سوديك" },
  { en: "Palm Hills", ar: "بالم هيلز" },
  { en: "Talaat Moustafa", ar: "طلعت مصطفى" },
  { en: "Mountain View", ar: "ماونتن فيو" },
  { en: "Emaar Misr", ar: "إعمار مصر" },
  { en: "Mivida", ar: "ميڤيدا" },
  { en: "Palm Hills New Cairo", ar: "بالم هيلز القاهرة الجديدة" },
];

export function PartnerWall({ locale }: { locale: "en" | "ar" }) {
  const t = useTranslations("home.partners");

  return (
    <section className="relative bg-stone py-20 lg:py-28 border-y border-navy/10">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal as="header" className="mb-12 lg:mb-16 max-w-3xl">
          <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-h3-mobile lg:text-h3 leading-tight tracking-tight-heading font-medium text-balance">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-navy/55 text-pretty">
            {t("subtitle")}
          </p>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 items-center">
            {PLACEHOLDER_PARTNERS.map((p) => (
              <div
                key={p.en}
                className="flex items-center justify-center grayscale opacity-65 hover:opacity-100 hover:grayscale-0 transition-all duration-300 ease-out-expo h-12"
              >
                <span className="text-base lg:text-lg font-medium tracking-tight-heading text-navy">
                  {p[locale]}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
