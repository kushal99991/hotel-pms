import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { appConfig } from "config/app.config";

mapboxgl.accessToken = appConfig.mapBoxToken;

interface BookingData {
  lat: number;
  lng: number;
  type: "past" | "future";
  count: number;
  location: string;
}

interface MapGlobeProps {
  bookingData: BookingData[];
  searchQuery?: string;
}

const MapGlobe: React.FC<MapGlobeProps> = ({ bookingData, searchQuery }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapRef.current!,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-98.5795, 39.8283],
      zoom: 3,
      projection: { name: "globe" },
      antialias: true,
    });

    mapInstanceRef.current = map;

    map.on("style.load", () => {
      map.setFog({
        color: "rgba(255,255,255,0.6)",
        "high-color": "#add8e6",
        "horizon-blend": 0.15,
        "space-color": "#000000",
        "star-intensity": 0.2,
      });

      // Add all markers
      bookingData.forEach((d) => {
        const el = document.createElement("div");
        el.style.width = "12px";
        el.style.height = "12px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = d.type === "past" ? "#00e6aa" : "#3366ff";
        el.style.boxShadow = "0 0 8px rgba(0,0,0,0.3)";
        el.title = `${d.location}: ${d.count} guests`;

        new mapboxgl.Marker({ element: el })
          .setLngLat([d.lng, d.lat])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<strong>${d.location}</strong><br/>${d.count} ${
                d.type === "past" ? "past guests" : "future bookings"
              }`
            )
          )
          .addTo(map);
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [bookingData]);

  // Effect to handle map fly-to on search
  useEffect(() => {
    if (!searchQuery || !mapInstanceRef.current) return;

    const match = bookingData.find((d) =>
      d.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (match) {
      mapInstanceRef.current.flyTo({
        center: [match.lng, match.lat],
        zoom: 5,
        essential: true,
      });
    }
  }, [searchQuery, bookingData]);

  return (
    <div
      ref={mapRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
};

export default MapGlobe;
