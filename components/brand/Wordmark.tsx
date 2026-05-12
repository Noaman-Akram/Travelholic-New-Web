import { cn } from "@/lib/utils/cn";

type Tone = "navy" | "stone" | "maroon" | "olive" | "butter";

const toneClass: Record<Tone, string> = {
  navy: "text-navy",
  stone: "text-stone",
  maroon: "text-maroon",
  olive: "text-olive",
  butter: "text-butter",
};

export function Wordmark({
  tone = "navy",
  size = "md",
  locale = "en",
  className,
}: {
  tone?: Tone;
  size?: "sm" | "md" | "lg" | "xl";
  locale?: "en" | "ar";
  className?: string;
}) {
  const sizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
    xl: "text-4xl md:text-5xl",
  }[size];

  return (
    <span
      className={cn(
        "inline-block uppercase font-sans font-semibold leading-none tracking-[0.06em]",
        sizeClass,
        toneClass[tone],
        className,
      )}
      aria-label="Travelholic"
    >
      {locale === "ar" ? "تراڤل هوليك" : "TRAVELHOLIC"}
    </span>
  );
}
