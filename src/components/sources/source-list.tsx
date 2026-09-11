import type { Source } from '@/contracts/source';

export function SourceList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) {
    return <p className="empty-copy">No sources were returned.</p>;
  }

  return (
    <ul className="source-list">
      {sources.map(source => (
        <li className="source-card" key={source.id}>
          <div>
            <span className="eyebrow">
              {source.official ? 'Official source' : 'External source'}
            </span>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.title}
            </a>
          </div>
          <p>{source.publisher}</p>
        </li>
      ))}
    </ul>
  );
}
