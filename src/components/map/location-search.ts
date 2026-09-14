import type { Location } from '@/contracts/location';

export function filterLocations(locations: Location[], query: string): Location[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return locations;

  return locations.filter(location =>
    [location.name, location.category, location.description, location.address]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery),
  );
}
