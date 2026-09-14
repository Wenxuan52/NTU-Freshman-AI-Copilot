import type { Location } from '@/contracts/location';

type LocationListProps = {
  locations: Location[];
  selectedLocationId: string | null;
  onSelectLocation: (locationId: string) => void;
};

export function LocationList({
  locations,
  selectedLocationId,
  onSelectLocation,
}: LocationListProps) {
  if (locations.length === 0) {
    return <p className="empty-copy">No structured locations were returned.</p>;
  }

  return (
    <ul className="location-list">
      {locations.map(location => {
        const selected = location.id === selectedLocationId;

        return (
          <li key={location.id}>
            <button
              className={`location-card${selected ? ' selected' : ''}`}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectLocation(location.id)}
            >
              <span className="location-card-heading">
                <strong>{location.name}</strong>
                <span>
                  {location.category}
                  {location.source_id === 'manual-user-entry'
                    ? ' · manual · needs review'
                    : ''}
                </span>
              </span>
              <span>{location.description}</span>
              <span>{location.address}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
