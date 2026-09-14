import { describe, expect, it } from 'vitest';

import {
  createManualLocation,
  ManualLocationInputSchema,
} from '@/components/map/manual-location';

describe('manual map locations', () => {
  const validInput = {
    name: 'My meeting point',
    category: 'Personal',
    description: 'A temporary point for this session.',
    address: 'NTU, Singapore',
    latitude: '1.3455',
    longitude: '103.6805',
  };

  it('rejects coordinates outside the map bounds', () => {
    expect(
      ManualLocationInputSchema.safeParse({ ...validInput, latitude: '91' })
        .success,
    ).toBe(false);
    expect(
      ManualLocationInputSchema.safeParse({ ...validInput, longitude: '-181' })
        .success,
    ).toBe(false);
  });

  it('creates a local location that is explicitly marked for review', () => {
    const location = createManualLocation(validInput, 'manual-test-location');

    expect(location).toMatchObject({
      id: 'manual-test-location',
      latitude: 1.3455,
      longitude: 103.6805,
      source_id: 'manual-user-entry',
      coordinate_status: 'needs_review',
    });
  });
});
