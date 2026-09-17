'use client';

import { useMemo, useState } from 'react';

import {
  acronymDirectory,
  filterAcronyms,
  type AcronymSource,
} from '@/components/acronyms/acronym-directory';

const dateFormatter = new Intl.DateTimeFormat('en-SG', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function AcronymsPanel() {
  const [query, setQuery] = useState('');
  const filteredAcronyms = useMemo(
    () => filterAcronyms(acronymDirectory.acronyms, query),
    [query],
  );
  const sourcesById = useMemo(
    () =>
      new Map<string, AcronymSource>(
        acronymDirectory.sources.map(source => [source.id, source]),
      ),
    [],
  );
  const hasQuery = query.trim().length > 0;
  const reviewedAt = dateFormatter.format(new Date(acronymDirectory.reviewed_at));

  return (
    <div className="acronyms-panel">
      <div className="acronyms-heading">
        <div>
          <h2>Decode NTU, instantly.</h2>
        </div>
        <div className="acronym-monogram" aria-hidden="true">
          Aa
        </div>
      </div>

      <div className="acronym-search-shell">
        <span className="acronym-search-mark" aria-hidden="true">
         ⌕
        </span>
        <label className="sr-only" htmlFor="acronym-search-input">
          Search NTU acronyms
        </label>
        <input
          id="acronym-search-input"
          type="search"
          autoComplete="off"
          value={query}
          placeholder="Try MSE, North Spine, or computing"
          onChange={event => setQuery(event.target.value)}
        />
        {hasQuery ? (
          <button type="button" onClick={() => setQuery('')}>
            Clear
          </button>
        ) : (
          <span className="acronym-search-hint">Local only</span>
        )}
      </div>

      <div className="acronym-results-meta" aria-live="polite">
        <span>
          {hasQuery
            ? `${filteredAcronyms.length} of ${acronymDirectory.acronyms.length}`
            : `${acronymDirectory.acronyms.length} reviewed entries`}
        </span>
        <span>Reviewed {reviewedAt}</span>
      </div>

      {filteredAcronyms.length > 0 ? (
        <ol className="acronym-list">
          {filteredAcronyms.map(entry => {
            const source = sourcesById.get(entry.source_id);
            if (!source) return null;

            return (
              <li className="acronym-card" key={entry.id}>
                <div className="acronym-code">
                  <strong>{entry.acronym}</strong>
                  <span>{entry.category}</span>
                </div>
                <div className="acronym-definition">
                  <h3>{entry.name}</h3>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="acronym-empty" role="status">
          <span aria-hidden="true">?</span>
          <h3>No reviewed match</h3>
          <p>
            Try the full name or a broader term. This directory will not guess
            an abbreviation that is absent from its official sources.
          </p>
          <button type="button" onClick={() => setQuery('')}>
            Browse all acronyms
          </button>
        </div>
      )}

      <footer className="acronym-provenance">
        <div>
          <span className="eyebrow">Snapshot provenance</span>
          <p>
            Names are included only when the abbreviation is explicitly shown
            by an official NTU source.
          </p>
        </div>
        <div className="acronym-source-links">
          {acronymDirectory.sources.map(source => (
            <a href={source.url} key={source.id} target="_blank" rel="noreferrer">
              {source.title}
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
