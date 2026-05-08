import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * Inline SVG phone frame with a screenshot inside.
 * Simple, scalable, no extra deps. Replace `screen` with brand product UI in launch.
 */
export function PhoneMockup({
  screen,
  alt,
  className,
  tone = "navy",
}: {
  screen: string;
  alt: string;
  className?: string;
  tone?: "navy" | "stone";
}) {
  const frame = tone === "navy" ? "#001D2E" : "#0e1a26";
  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 220 440"
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full h-auto drop-shadow-[0_24px_60px_rgba(0,39,62,0.25)]"
        aria-hidden="true"
      >
        {/* Outer frame */}
        <rect x="2" y="2" width="216" height="436" rx="36" fill={frame} />
        {/* Inner bezel */}
        <rect x="9" y="9" width="202" height="422" rx="32" fill="#000" />
        {/* Screen aperture (transparent so the foreignObject sits beneath) */}
        <rect x="14" y="14" width="192" height="412" rx="28" fill="#11161B" />
        {/* Notch */}
        <rect x="86" y="20" width="48" height="14" rx="7" fill="#000" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative w-[88%] h-[94%] overflow-hidden rounded-[28px]">
          <Image
            src={screen}
            alt={alt}
            fill
            sizes="220px"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
