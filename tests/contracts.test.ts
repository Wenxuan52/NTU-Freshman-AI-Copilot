import { describe, expect, it } from 'vitest';

import { LocationSchema } from '@/contracts/location';
import { SourceSchema } from '@/contracts/source';
import { ToolResultSchema } from '@/contracts/tool-result';

const validSource = {
  id: 'source-1',
  title: 'NTU official source',
  url: 'https://www.ntu.edu.sg/admissions',
  publisher: 'Nanyang Technological University',
  published_at: null,
  retrieved_at: '2026-09-11T00:00:00.000Z',
  official: true,
};

describe('shared contracts', () => {
  it('accepts a valid source', () => {
    expect(SourceSchema.safeParse(validSource).success).toBe(true);
  });

  it('rejects an invalid source URL', () => {
    expect(SourceSchema.safeParse({ ...validSource, url: 'not a url' }).success).toBe(false);
  });

  it('requires explicit verification in every ToolResult', () => {
    expect(
      ToolResultSchema.safeParse({
        content: 'Result',
        sources: [validSource],
        locations: [],
      }).success,
    ).toBe(false);
  });

  it('rejects coordinates outside valid latitude and longitude ranges', () => {
    const location = {
      id: 'invalid-location',
      name: 'Invalid location',
      category: 'Test',
      description: 'Out-of-range coordinates.',
      address: 'NTU, Singapore',
      latitude: 91,
      longitude: 181,
      opening_hours: null,
      source_id: 'source-1',
      coordinate_status: 'verified',
    };

    expect(LocationSchema.safeParse(location).success).toBe(false);
  });
});
