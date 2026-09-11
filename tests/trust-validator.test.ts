import { describe, expect, it } from 'vitest';

import { validateToolResult } from '@/trust/validator';

const baseResult = {
  content: 'A factual test result.',
  sources: [
    {
      id: 'source-1',
      title: 'NTU official source',
      url: 'https://www.ntu.edu.sg/admissions',
      publisher: 'Nanyang Technological University',
      published_at: null,
      retrieved_at: '2026-09-11T00:00:00.000Z',
      official: true,
    },
  ],
  locations: [],
  verification: {
    status: 'verified',
    checks: ['source_present', 'official_domain_checked'],
    warnings: [],
    reviewed_at: '2026-09-11T00:00:00.000Z',
  },
};

describe('deterministic trust validator', () => {
  it('accepts a result backed by an exact NTU domain', () => {
    expect(validateToolResult(baseResult).accepted).toBe(true);
  });

  it('accepts a safe subdomain of ntu.edu.sg', () => {
    const validation = validateToolResult({
      ...baseResult,
      sources: [
        {
          ...baseResult.sources[0],
          url: 'https://admissions.ntu.edu.sg/guide',
        },
      ],
    });

    expect(validation.accepted).toBe(true);
  });

  it('rejects a factual result with no source', () => {
    const validation = validateToolResult({
      ...baseResult,
      sources: [],
      verification: { ...baseResult.verification, status: 'needs_review' },
    });

    expect(validation.accepted).toBe(false);
    expect(validation.errors).toContain(
      'A factual Tool result must include at least one source.',
    );
  });

  it('rejects the deceptive ntu.edu.sg.evil.example hostname', () => {
    const validation = validateToolResult({
      ...baseResult,
      sources: [
        {
          ...baseResult.sources[0],
          url: 'https://ntu.edu.sg.evil.example/policy',
        },
      ],
    });

    expect(validation.accepted).toBe(false);
    expect(validation.errors.join(' ')).toMatch(/exact NTU domain/);
  });

  it('rejects non-http protocols', () => {
    const validation = validateToolResult({
      ...baseResult,
      sources: [
        {
          ...baseResult.sources[0],
          url: 'ftp://www.ntu.edu.sg/resource',
          official: false,
        },
      ],
      verification: { ...baseResult.verification, status: 'needs_review' },
    });

    expect(validation.accepted).toBe(false);
    expect(validation.errors.join(' ')).toMatch(/http or https/);
  });

  it('rejects sources without retrieved_at', () => {
    const sourceWithoutRetrievedAt: Record<string, unknown> = {
      ...baseResult.sources[0],
    };
    delete sourceWithoutRetrievedAt.retrieved_at;
    const validation = validateToolResult({
      ...baseResult,
      sources: [sourceWithoutRetrievedAt],
    });

    expect(validation.accepted).toBe(false);
    expect(validation.errors.join(' ')).toMatch(/retrieved_at/);
  });

  it('rejects locations whose coordinates are not verified', () => {
    const validation = validateToolResult({
      ...baseResult,
      locations: [
        {
          id: 'test-location',
          name: 'Test location',
          category: 'Test',
          description: 'Synthetic test location.',
          address: 'NTU, Singapore',
          latitude: 1.34,
          longitude: 103.68,
          opening_hours: null,
          source_id: 'source-1',
          coordinate_status: 'needs_review',
        },
      ],
      verification: { ...baseResult.verification, status: 'needs_review' },
    });

    expect(validation.accepted).toBe(false);
    expect(validation.errors.join(' ')).toMatch(/unverified coordinates/);
  });
});
