import { cn } from "@/lib/utils/cn";

type Tone = "navy" | "stone" | "maroon" | "olive" | "butter" | "currentColor";

const toneClass: Record<Tone, string> = {
  navy: "text-navy",
  stone: "text-stone",
  maroon: "text-maroon",
  olive: "text-olive",
  butter: "text-butter",
  currentColor: "",
};

export function KeyholeMark({
  tone = "navy",
  className,
  size = 28,
  title = "Travelholic",
}: {
  tone?: Tone;
  className?: string;
  size?: number;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 140"
      width={size}
      height={(size * 140) / 100}
      role="img"
      aria-label={title}
      className={cn(toneClass[tone], "shrink-0", className)}
      fill="currentColor"
    >
      <title>{title}</title>
      {/* Square head */}
      <rect x="30" y="20" width="40" height="40" rx="1" />
      {/* Body — trapezoid widening downward */}
      <path d="M 36 60 H 64 L 80 120 H 20 Z" />
    </svg>
  );
}
