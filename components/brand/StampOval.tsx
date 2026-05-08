import { cn } from "@/lib/utils/cn";

type Tone = "navy" | "stone" | "maroon" | "olive";

const toneStroke: Record<Tone, string> = {
  navy: "stroke-navy",
  stone: "stroke-stone",
  maroon: "stroke-maroon",
  olive: "stroke-olive",
};

const toneText: Record<Tone, string> = {
  navy: "fill-navy",
  stone: "fill-stone",
  maroon: "fill-maroon",
  olive: "fill-olive",
};

/**
 * Bilingual oval lockup recreated from Logo_Stamps.pdf.
 * Renders TRAVELHOLIC top, تراڤل هوليك middle, "homes not rooms" bottom inside a double-stroke oval.
 * Uses textPath so the wordmarks arc along the oval geometry.
 */
export function StampOval({
  tone = "navy",
  size = 200,
  className,
  title = "Travelholic — homes not rooms",
}: {
  tone?: Tone;
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 300"
      width={size}
      height={(size * 300) / 400}
      role="img"
      aria-label={title}
      className={cn("shrink-0", className)}
      fill="none"
    >
      <title>{title}</title>
      {/* Outer oval */}
      <ellipse
        cx="200"
        cy="150"
        rx="190"
        ry="135"
        className={cn(toneStroke[tone])}
        strokeWidth={3}
      />
      {/* Inner oval */}
      <ellipse
        cx="200"
        cy="150"
        rx="180"
        ry="125"
        className={cn(toneStroke[tone])}
        strokeWidth={1.5}
      />

      {/* Top arc: TRAVELHOLIC */}
      <defs>
        <path
          id="th-top-arc"
          d="M 30 150 A 170 115 0 0 1 370 150"
        />
        <path
          id="th-bottom-arc"
          d="M 50 165 A 150 100 0 0 0 350 165"
        />
      </defs>
      <text
        className={cn(toneText[tone])}
        style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.18em" }}
      >
        <textPath href="#th-top-arc" startOffset="50%" textAnchor="middle">
          TRAVELHOLIC
        </textPath>
      </text>

      {/* Center bilingual block */}
      <g>
        <text
          x="200"
          y="160"
          textAnchor="middle"
          className={cn(toneText[tone])}
          style={{ fontSize: 28, fontWeight: 500 }}
        >
          تراڤل هوليك
        </text>
      </g>

      {/* Bottom arc: homes not rooms (cursive substitute = italic Inter) */}
      <text
        className={cn(toneText[tone])}
        style={{ fontSize: 22, fontStyle: "italic" }}
      >
        <textPath href="#th-bottom-arc" startOffset="50%" textAnchor="middle">
          homes not rooms
        </textPath>
      </text>
    </svg>
  );
}
