"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { destinations } from "@/lib/data";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Destination } from "@/lib/data/types";

// Custom Travelholic-themed pin (navy circle with butter dot)
const customIcon = L.divIcon({
  className: "th-marker",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#00273E;border:2px solid #F2E6B7;box-shadow:0 2px 8px rgba(0,39,62,0.4);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function DestinationsMap({
  filtered,
}: {
  filtered?: Destination[];
}) {
  const locale = useLocale() as AppLocale;
  const items = filtered ?? destinations;

  const center = useMemo<[number, number]>(() => {
    if (items.length === 0) return [30.0444, 31.2357];
    const lat = items.reduce((s, d) => s + d.coordinates.lat, 0) / items.length;
    const lng = items.reduce((s, d) => s + d.coordinates.lng, 0) / items.length;
    return [lat, lng];
  }, [items]);

  // Refresh map size on mount in case container animations changed it.
  useEffect(() => {
    const t = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative h-[420px] lg:h-[560px] w-full overflow-hidden rounded-3xl ring-1 ring-navy/10 bg-stone-100">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {items.map((d) => (
          <Marker
            key={d.slug}
            position={[d.coordinates.lat, d.coordinates.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="font-sans">
                <p className="text-[10px] uppercase tracking-eyebrow text-navy/55 mb-1">
                  {d.areaName[locale]}
                </p>
                <p className="text-sm font-semibold text-navy leading-tight">
                  {d.name[locale]}
                </p>
                <Link
                  href={`/destinations/${d.slug}`}
                  className="mt-2 inline-block text-xs underline text-navy"
                >
                  View →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
