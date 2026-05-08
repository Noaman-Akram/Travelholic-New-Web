import { cn } from "@/lib/utils/cn";
import { KeyholeMark } from "./KeyholeMark";

/**
 * Editorial section divider — a thin rule with the Keyhole mark centered.
 * Used between Why-pillars and large-quote testimonials.
 */
export function StampDivider({
  tone = "navy",
  className,
}: {
  tone?: "navy" | "stone" | "olive" | "maroon";
  className?: string;
}) {
  const lineColor = {
    navy: "before:bg-navy/20 after:bg-navy/20",
    stone: "before:bg-stone/30 after:bg-stone/30",
    olive: "before:bg-olive/30 after:bg-olive/30",
    maroon: "before:bg-maroon/25 after:bg-maroon/25",
  }[tone];

  return (
    <div
      role="separator"
      aria-hidden="true"
      className={cn(
        "relative flex items-center justify-center gap-4 py-4 w-full",
        "before:content-[''] before:flex-1 before:h-px",
        "after:content-[''] after:flex-1 after:h-px",
        lineColor,
        className,
      )}
    >
      <KeyholeMark tone={tone} size={22} />
    </div>
  );
}
