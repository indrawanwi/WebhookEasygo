"use client";

import { useEffect, useState, useRef } from "react";

interface EventMapProps {
  lat: number;
  lon: number;
  vehicle?: string | null;
  eventName?: string | null;
  address?: string | null;
  height?: string;
}

export function EventMap({
  lat,
  lon,
  vehicle = "Vehicle",
  eventName = "Event Location",
  address = "Address unavailable",
  height = "320px",
}: EventMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-[var(--border-color)] text-zinc-400 text-sm animate-pulse"
      >
        Loading Map View...
      </div>
    );
  }

  return <MapContainer lat={lat} lon={lon} vehicle={vehicle} eventName={eventName} address={address} height={height} />;
}

function MapContainer({
  lat,
  lon,
  vehicle,
  eventName,
  address,
  height,
}: EventMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Leaflet CSS dynamically
    const linkId = "leaflet-css-cdn";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      if (!containerRef.current) return;

      // Destroy old instance if re-initializing
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const customIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const map = L.map(containerRef.current).setView([lat, lon], 14);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; font-size: 13px; line-height: 1.4; color: #111827;">
          <div style="font-weight: 700; font-size: 14px; color: #2563EB; margin-bottom: 2px;">
            ${vehicle || "Vehicle"}
          </div>
          <div style="font-weight: 600; color: #374151;">
            ${eventName || "Event"}
          </div>
          <div style="color: #6B7280; font-size: 12px; margin-top: 4px;">
            ${address || ""}
          </div>
          <div style="font-family: monospace; font-size: 11px; color: #9CA3AF; margin-top: 6px;">
            Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}
          </div>
        </div>
      `;

      L.marker([lat, lon], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent)
        .openPopup();
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lon, vehicle, eventName, address]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[var(--border-color)]">
      <div ref={containerRef} style={{ height }} className="w-full z-10" />
    </div>
  );
}

