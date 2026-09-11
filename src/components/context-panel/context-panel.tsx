import type { ToolResult } from '@/contracts/tool-result';
import { SourceList } from '@/components/sources/source-list';

export function ContextPanel({ result }: { result: ToolResult | null }) {
  return (
    <aside className="context-panel" aria-label="Answer context">
      <div className="panel-heading">
        <span className="eyebrow">Context panel</span>
        <h2>Sources &amp; map</h2>
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

      <section className="map-placeholder" aria-labelledby="map-heading">
        <div className="section-title-row">
          <h3 id="map-heading">Map</h3>
          <span className="muted-label">MVP placeholder</span>
        </div>
        <div className="map-grid" aria-hidden="true">
          <span className="map-pin" />
        </div>
        <p>
          Structured locations will appear here. The Mock Tool intentionally
          returns an empty locations array.
        </p>
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
