'use client';

import dynamic from 'next/dynamic';

import type { ToolResult } from '@/contracts/tool-result';
import { LocationList } from '@/components/map/location-list';
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
        {result ? (
          <LeafletMap
            locations={result.locations}
            selectedLocationId={selectedLocationId}
            onSelectLocation={onSelectLocation}
          />
        ) : (
          <p className="empty-copy">Locations from the latest Tool result appear here.</p>
        )}
      </section>

      <section aria-labelledby="locations-heading">
        <div className="section-title-row">
          <h3 id="locations-heading">Locations</h3>
          <span className="count-badge">{result?.locations.length ?? 0}</span>
        </div>
        {result ? (
          <LocationList
            locations={result.locations}
            selectedLocationId={selectedLocationId}
            onSelectLocation={onSelectLocation}
          />
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
