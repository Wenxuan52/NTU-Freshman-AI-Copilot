import { describe, expect, it } from 'vitest';

import { filterLocations } from '@/components/map/location-search';
import type { Location } from '@/contracts/location';

const locations: Location[] = [
  {
    id: 'north-spine-food-court',
    name: 'North Spine Food Court',
    category: 'Food court',
    description: 'Food court near Lee Wee Nam Library.',
    address: '76 Nanyang Drive, Singapore 637331',
    latitude: 1.347,
    longitude: 103.68007,
    opening_hours: null,
    source_id: 'source-1',
    coordinate_status: 'verified',
  },
  {
    id: 'the-crowded-bowl',
    name: 'The Crowded Bowl',
    category: 'Restaurant',
    description: 'Restaurant on Nanyang Avenue.',
    address: '50 Nanyang Avenue, Singapore 639798',
    latitude: 1.34683,
    longitude: 103.68079,
    opening_hours: null,
    source_id: 'source-2',
    coordinate_status: 'verified',
  },
];

describe('location search', () => {
  it('returns all locations for an empty query', () => {
    expect(filterLocations(locations, '  ')).toEqual(locations);
  });

  it('matches names, categories, addresses, and ignores case', () => {
    expect(filterLocations(locations, 'NORTH SPINE').map(location => location.id)).toEqual([
      'north-spine-food-court',
    ]);
    expect(filterLocations(locations, 'restaurant').map(location => location.id)).toEqual([
      'the-crowded-bowl',
    ]);
    expect(filterLocations(locations, '639798').map(location => location.id)).toEqual([
      'the-crowded-bowl',
    ]);
  });
});
