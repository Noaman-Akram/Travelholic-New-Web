import { cn } from "@/lib/utils/cn";
import { KeyholeMark } from "./KeyholeMark";
import { Wordmark } from "./Wordmark";

type Tone = "navy" | "stone" | "maroon" | "olive";

/**
 * Composite brand lockup: keyhole + wordmark side-by-side.
 * Default size is for header use. Use `<KeyholeMark>` or `<Wordmark>` standalone where needed.
 */
export function Logo({
  tone = "navy",
  locale = "en",
  size = "md",
  className,
}: {
  tone?: Tone;
  locale?: "en" | "ar";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const markSize = { sm: 22, md: 28, lg: 40 }[size];
  const wordSize = ({ sm: "sm", md: "md", lg: "lg" } as const)[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 leading-none",
        className,
      )}
    >
      <KeyholeMark tone={tone} size={markSize} />
      <Wordmark tone={tone} size={wordSize} locale={locale} />
    </span>
  );
}
