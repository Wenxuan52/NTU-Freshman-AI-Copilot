import { describe, expect, it } from 'vitest';

import { ToolResultSchema } from '@/contracts/tool-result';
import {
  executeFoodLocation,
  FoodLocationInputSchema,
} from '@/tools/food-location/food-location-tool';

describe('Food / Location Tool', () => {
  it('validates its query input', () => {
    expect(FoodLocationInputSchema.safeParse({ query: '' }).success).toBe(false);
    expect(
      FoodLocationInputSchema.safeParse({ query: 'Where can I eat near North Spine?' })
        .success,
    ).toBe(true);
  });

  it('returns structured locations with traceable coordinate sources offline', async () => {
    const result = await executeFoodLocation({
      query: 'Where can I eat near North Spine?',
    });

    expect(ToolResultSchema.safeParse(result).success).toBe(true);
    expect(result.locations.length).toBeGreaterThanOrEqual(3);
    expect(result.verification.status).toBe('needs_review');

    const sourceIds = new Set(result.sources.map(source => source.id));
    for (const location of result.locations) {
      expect(sourceIds.has(location.source_id)).toBe(true);
      expect(location.coordinate_status).toBe('verified');
      expect(location.latitude).toBeGreaterThanOrEqual(-90);
      expect(location.latitude).toBeLessThanOrEqual(90);
      expect(location.longitude).toBeGreaterThanOrEqual(-180);
      expect(location.longitude).toBeLessThanOrEqual(180);
    }
  });
});
