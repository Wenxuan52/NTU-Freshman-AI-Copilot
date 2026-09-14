'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

import { ManualLocationForm } from '@/components/map/manual-location-form';
import type { Location } from '@/contracts/location';
import type { ToolResult } from '@/contracts/tool-result';
import { LocationList } from '@/components/map/location-list';
import { filterLocations } from '@/components/map/location-search';
import { SourceList } from '@/components/sources/source-list';

const LeafletMap = dynamic(
  () =>
    import('@/components/map/leaflet-map').then(module => module.LeafletMap),
  {
    ssr: false,
    loading: () => <p className="empty-copy">Loading map…</p>,
  },
);

type ContextPanelProps = {
  result: ToolResult | null;
  selectedLocationId: string | null;
  onSelectLocation: (locationId: string) => void;
};

export function ContextPanel({
  result,
  selectedLocationId,
  onSelectLocation,
}: ContextPanelProps) {
  const [manualLocations, setManualLocations] = useState<Location[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const locations = useMemo(() => {
    const uniqueLocations = new Map<string, Location>();

    for (const location of [...(result?.locations ?? []), ...manualLocations]) {
      uniqueLocations.set(location.id, location);
    }

    return [...uniqueLocations.values()];
  }, [manualLocations, result]);
  const filteredLocations = useMemo(
    () => filterLocations(locations, locationQuery),
    [locations, locationQuery],
  );

  function addManualLocation(location: Location) {
    setManualLocations(current => [...current, location]);
    onSelectLocation(location.id);
    setIsAddFormOpen(false);
  }

  return (
    <aside className="context-panel" aria-label="Answer context">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Campus context</span>
          <h2>Evidence &amp; place</h2>
        </div>
        <span className="panel-index" aria-hidden="true">01</span>
      </div>

      <section aria-labelledby="sources-heading">
        <div className="section-title-row">
          <h3 id="sources-heading">Sources</h3>
          <span className="count-badge">{result?.sources.length ?? 0}</span>
        </div>
        {result ? (
          <SourceList sources={result.sources} />
        ) : (
          <p className="empty-copy">Sources from the latest Tool result appear here.</p>
        )}
      </section>

      <section className="map-section" aria-labelledby="map-heading">
        <div className="section-title-row">
          <h3 id="map-heading">Map</h3>
          <span className="muted-label">OpenStreetMap</span>
        </div>
        {filteredLocations.length > 0 || locations.length === 0 ? (
          <LeafletMap
            locations={filteredLocations}
            selectedLocationId={selectedLocationId}
            onSelectLocation={onSelectLocation}
          />
        ) : (
          <p className="empty-copy">Locations from the latest Tool result appear here.</p>
        )}
      </section>

      <section aria-labelledby="add-location-heading">
        <div className="section-title-row">
          <h3 id="add-location-heading">Map tools</h3>
          <button
            className="secondary-button add-location-button"
            type="button"
            onClick={() => setIsAddFormOpen(current => !current)}
          >
            {isAddFormOpen ? 'Close' : 'Add location'}
          </button>
        </div>
        {isAddFormOpen ? (
          <ManualLocationForm
            onAddLocation={addManualLocation}
            onCancel={() => setIsAddFormOpen(false)}
          />
        ) : null}
      </section>

      <section aria-labelledby="locations-heading">
        <div className="section-title-row">
          <h3 id="locations-heading">Locations</h3>
          <span className="count-badge">
            {locationQuery.trim()
              ? `${filteredLocations.length}/${locations.length}`
              : locations.length}
          </span>
        </div>
        <div className="location-search">
          <label className="sr-only" htmlFor="location-search-input">
            Search locations
          </label>
          <input
            id="location-search-input"
            type="search"
            value={locationQuery}
            placeholder="Search name, category, or address"
            onChange={event => setLocationQuery(event.target.value)}
          />
          {locationQuery ? (
            <button
              type="button"
              aria-label="Clear location search"
              onClick={() => setLocationQuery('')}
            >
              Clear
            </button>
          ) : null}
        </div>
        {filteredLocations.length > 0 ? (
          <LocationList
            locations={filteredLocations}
            selectedLocationId={selectedLocationId}
            onSelectLocation={onSelectLocation}
          />
        ) : locations.length > 0 ? (
          <p className="empty-copy">No locations match your search.</p>
        ) : (
          <p className="empty-copy">Locations from the latest Tool result appear here.</p>
        )}
      </section>

      {result ? (
        <section className={`verification ${result.verification.status}`}>
          <span className="eyebrow">Verification</span>
          <strong>{result.verification.status.replace('_', ' ')}</strong>
          {result.verification.warnings.map(warning => (
            <p key={warning}>{warning}</p>
          ))}
        </section>
      ) : null}
    </aside>
  );
}
