'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

import type { Location } from '@/contracts/location';

type LeafletMapProps = {
  locations: Location[];
  selectedLocationId: string | null;
  onSelectLocation: (locationId: string) => void;
};

const NTU_CENTER: L.LatLngTuple = [1.3455, 103.6805];

export function LeafletMap({
  locations,
  selectedLocationId,
  onSelectLocation,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const onSelectLocationRef = useRef(onSelectLocation);

  onSelectLocationRef.current = onSelectLocation;

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const map = L.map(container, { scrollWheelZoom: true }).setView(
      NTU_CENTER,
      15,
    );
    const markerLayer = L.layerGroup().addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;
    markerLayerRef.current = markerLayer;

    return () => {
      markerLayer.clearLayers();
      map.remove();

      if (mapRef.current === map) mapRef.current = null;
      if (markerLayerRef.current === markerLayer) {
        markerLayerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;

    if (!map || !markerLayer) return;

    markerLayer.clearLayers();

    for (const location of locations) {
      const selected = location.id === selectedLocationId;
      const marker = L.circleMarker(
        [location.latitude, location.longitude],
        {
          color: selected ? '#071a2d' : '#0b6faf',
          fillColor: selected ? '#35c2d0' : '#0b6faf',
          fillOpacity: 0.95,
          radius: selected ? 10 : 8,
          weight: 3,
        },
      );

      marker
        .bindPopup(
          `<strong>${location.name}</strong><br />${location.category}<br />${location.address}`,
        )
        .on('click', () => {
          onSelectLocationRef.current(location.id);
        })
        .addTo(markerLayer);
    }

    const selectedLocation = locations.find(
      location => location.id === selectedLocationId,
    );

    if (selectedLocation) {
      map.flyTo(
        [selectedLocation.latitude, selectedLocation.longitude],
        Math.max(map.getZoom(), 16),
        { duration: 0.45 },
      );
    } else if (locations.length === 1) {
      map.setView(
        [locations[0].latitude, locations[0].longitude],
        16,
        { animate: false },
      );
    } else if (locations.length > 1) {
      map.fitBounds(
        locations.map(
          location => [location.latitude, location.longitude] as L.LatLngTuple,
        ),
        { padding: [24, 24], maxZoom: 16, animate: false },
      );
    }

    window.setTimeout(() => map.invalidateSize(), 0);
  }, [locations, selectedLocationId]);

  return (
    <div className="leaflet-map-shell">
      <div
        ref={containerRef}
        className="leaflet-map"
        role="application"
        aria-label="NTU food and campus location map"
      />
      <p className="map-attribution-note">
        Map tiles © OpenStreetMap contributors. Venue details are shown with the
        Tool&apos;s verification status.
      </p>
    </div>
  );
}
