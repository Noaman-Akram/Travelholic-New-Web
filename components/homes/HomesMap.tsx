"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "@/i18n/navigation";
import { destinations } from "@/lib/data";
import { useCurrency } from "@/lib/currency/context";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { AppLocale } from "@/i18n/routing";
import type { Home } from "@/lib/data/types";

const customIcon = L.divIcon({
  className: "th-marker",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#00273E;border:2px solid #F2E6B7;box-shadow:0 2px 8px rgba(0,39,62,0.4);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function HomesMap({ results }: { results: Home[] }) {
  const locale = useLocale() as AppLocale;
  const { currency } = useCurrency();

  const center = useMemo<[number, number]>(() => {
    if (results.length === 0) return [30.0444, 31.2357];
    const lat = results.reduce((s, h) => s + h.coordinates.lat, 0) / results.length;
    const lng = results.reduce((s, h) => s + h.coordinates.lng, 0) / results.length;
    return [lat, lng];
  }, [results]);

  useEffect(() => {
    const t = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative h-[calc(100svh-200px)] min-h-[500px] w-full overflow-hidden rounded-3xl ring-1 ring-navy/10 bg-stone-100">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        {results.map((h) => {
          const dest = destinations.find((d) => d.slug === h.destinationSlug);
          return (
            <Marker
              key={h.slug}
              position={[h.coordinates.lat, h.coordinates.lng]}
              icon={customIcon}
            >
              <Popup>
                <div className="font-sans w-44">
                  {dest ? (
                    <p className="text-[10px] uppercase tracking-eyebrow text-navy/55 mb-1">
                      {dest.name[locale]}
                    </p>
                  ) : null}
                  <p className="text-sm font-semibold text-navy leading-tight">
                    {h.title[locale]}
                  </p>
                  <p className="mt-1 text-xs text-navy/70 tabular-nums">
                    {formatPrice(h.pricing.nightlyEGP, currency, locale)}{" "}
                    <span className="text-navy/45">/ night</span>
                  </p>
                  <Link
                    href={`/homes/${h.slug}`}
                    className="mt-2 inline-block text-xs underline text-navy"
                  >
                    View →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
