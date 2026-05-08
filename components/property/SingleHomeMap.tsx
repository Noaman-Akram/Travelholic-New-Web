"use client";

import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Home } from "@/lib/data/types";

const customIcon = L.divIcon({
  className: "th-marker",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#00273E;border:2px solid #F2E6B7;box-shadow:0 2px 8px rgba(0,39,62,0.4);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function SingleHomeMap({ home }: { home: Home }) {
  return (
    <div className="relative h-[360px] lg:h-[460px] rounded-3xl overflow-hidden ring-1 ring-navy/10 bg-stone-100">
      <MapContainer
        center={[home.coordinates.lat, home.coordinates.lng]}
        zoom={14}
        scrollWheelZoom={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        <Circle
          center={[home.coordinates.lat, home.coordinates.lng]}
          radius={250}
          pathOptions={{
            color: "#00273E",
            fillColor: "#F2E6B7",
            fillOpacity: 0.35,
            weight: 1,
          }}
        />
        <Marker
          position={[home.coordinates.lat, home.coordinates.lng]}
          icon={customIcon}
        />
      </MapContainer>
    </div>
  );
}
