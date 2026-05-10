"use client";

import { useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "@/i18n/navigation";
import { destinations } from "@/lib/data";
import { useCurrency } from "@/lib/currency/context";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { AppLocale } from "@/i18n/routing";
import type { Destination, Home } from "@/lib/data/types";

function districtIcon(count: number): L.DivIcon {
  return L.divIcon({
    className: "th-district-marker",
    html: `<div style="display:flex;align-items:center;justify-content:center;min-width:32px;height:32px;padding:0 8px;border-radius:9999px;background:#00273E;color:#F2E6B7;border:2px solid #F2E6B7;box-shadow:0 4px 14px rgba(0,39,62,0.35);font:600 12px/1 'Inter',system-ui,sans-serif;">${count}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

/**
 * Display-only offsets to spread pins out at the homes-index zoom level.
 * Several Travelholic districts sit within 1–2km of each other (the three
 * Golden Gates compounds; Lotus / 90th Street). At zoom 10 those collapse
 * into stacked pins. The popup links to the real destination page, so the
 * offset is purely visual.
 */
const PIN_OFFSET: Record<string, [number, number]> = {
  "gg-buildings": [-0.005, -0.03],
  "gg-villas": [0, -0.01],
  nomads: [0.02, 0.015],
  "near-cfc": [0.015, 0],
  "ninetieth-street": [0.02, 0],
  lotus: [-0.02, -0.005],
  auc: [0, 0.02],
};

type DistrictGroup = {
  destination: Destination;
  homes: Home[];
  startingNightlyEGP: number;
  position: [number, number];
};

export function HomesMap({ results }: { results: Home[] }) {
  const locale = useLocale() as AppLocale;
  const { currency } = useCurrency();
  const t = useTranslations("destinations");

  const groups = useMemo<DistrictGroup[]>(() => {
    const bySlug = new Map<string, Home[]>();
    for (const h of results) {
      const arr = bySlug.get(h.destinationSlug) ?? [];
      arr.push(h);
      bySlug.set(h.destinationSlug, arr);
    }
    const out: DistrictGroup[] = [];
    for (const [slug, homes] of bySlug) {
      const destination = destinations.find((d) => d.slug === slug);
      if (!destination) continue;
      const startingNightlyEGP = homes.reduce(
        (min, h) => Math.min(min, h.pricing.nightlyEGP),
        Number.POSITIVE_INFINITY,
      );
      const offset = PIN_OFFSET[destination.slug] ?? [0, 0];
      out.push({
        destination,
        homes,
        startingNightlyEGP: Number.isFinite(startingNightlyEGP) ? startingNightlyEGP : 0,
        position: [
          destination.coordinates.lat + offset[0],
          destination.coordinates.lng + offset[1],
        ],
      });
    }
    return out;
  }, [results]);

  const center = useMemo<[number, number]>(() => {
    if (groups.length === 0) return [30.0444, 31.2357];
    const lat = groups.reduce((s, g) => s + g.position[0], 0) / groups.length;
    const lng = groups.reduce((s, g) => s + g.position[1], 0) / groups.length;
    return [lat, lng];
  }, [groups]);

  useEffect(() => {
    const tm = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 200);
    return () => clearTimeout(tm);
  }, []);

  return (
    <div className="relative h-[calc(100svh-200px)] min-h-[500px] w-full overflow-hidden rounded-3xl ring-1 ring-navy/10 bg-stone-100">
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        {groups.map((g) => (
          <Marker
            key={g.destination.slug}
            position={g.position}
            icon={districtIcon(g.homes.length)}
          >
            <Popup>
              <div className="font-sans w-52">
                <p className="text-[10px] uppercase tracking-eyebrow text-navy/55 mb-1">
                  {g.destination.areaName[locale]}
                </p>
                <p className="text-sm font-semibold text-navy leading-tight">
                  {g.destination.name[locale]}
                </p>
                <p className="mt-2 text-xs text-navy/70 tabular-nums">
                  {t("homesIn", { count: g.homes.length })}
                  <span className="text-navy/35"> · </span>
                  {t("from")} {formatPrice(g.startingNightlyEGP, currency, locale)}
                  <span className="text-navy/45"> / night</span>
                </p>
                <Link
                  href={`/destinations/${g.destination.slug}`}
                  className="mt-3 inline-block text-xs underline text-navy"
                >
                  {t("viewDistrict")} →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
