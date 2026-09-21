import { describe, expect, it } from 'vitest';

import { validateToolResult } from '@/trust/validator';

const NOW = '2026-09-19T00:00:00.000Z';

const baseResult = {
  content: 'A factual test result.',
  sources: [
    {
      id: 'source-1',
      title: 'NTU official source',
      url: 'https://www.ntu.edu.sg/admissions',
      publisher: 'Nanyang Technological University',
      published_at: null,
      retrieved_at: '2026-09-18T00:00:00.000Z',
      official: true,
    },
  ],
  locations: [],
  verification: {
    status: 'verified',
    checks: ['source_present'],
    warnings: [],
    reviewed_at: NOW,
  },
};

function acceptedResult(
  validation: ReturnType<typeof validateToolResult>,
) {
  expect(validation.accepted).toBe(true);
  if (!validation.accepted) {
    throw new Error(validation.errors.join(' '));
  }
  return validation.result;
}

describe('deterministic trust validator', () => {
  it('verifies a result backed by an exact NTU domain', () => {
    const result = acceptedResult(validateToolResult(baseResult, { now: NOW }));

    expect(result.verification.status).toBe('verified');
    expect(result.verification.checks).toContain(
      'official_domain_checked:source-1',
    );
  });

  it('accepts a safe subdomain and recomputes an underclaimed official flag', () => {
    const result = acceptedResult(
      validateToolResult(
        {
          ...baseResult,
          sources: [
            {
              ...baseResult.sources[0],
              url: 'https://admissions.ntu.edu.sg/guide',
              official: false,
            },
          ],
        },
        { now: NOW },
      ),
    );

    expect(result.sources[0]?.official).toBe(true);
    expect(result.verification.status).toBe('verified');
  });

  it('normalizes a result with no source to unavailable without exposing its claim', () => {
    const result = acceptedResult(
      validateToolResult({ ...baseResult, sources: [] }, { now: NOW }),
    );

    expect(result.verification.status).toBe('unavailable');
    expect(result.content).not.toContain('factual test result');
    expect(result.locations).toEqual([]);
  });

  it('downgrades and corrects a deceptive official hostname', () => {
    const result = acceptedResult(
      validateToolResult(
        {
          ...baseResult,
          sources: [
            {
              ...baseResult.sources[0],
              url: 'https://ntu.edu.sg.evil.example/policy',
            },
          ],
        },
        { now: NOW },
      ),
    );

    expect(result.sources[0]?.official).toBe(false);
    expect(result.verification.status).toBe('needs_review');
    expect(result.verification.warnings.join(' ')).toMatch(/exact NTU domain/);
  });

  it('rejects non-http protocols', () => {
    const validation = validateToolResult(
      {
        ...baseResult,
        sources: [
          {
            ...baseResult.sources[0],
            url: 'ftp://www.ntu.edu.sg/resource',
            official: false,
          },
        ],
      },
      { now: NOW },
    );

    expect(validation.accepted).toBe(false);
    expect(validation.errors.join(' ')).toMatch(/http or https/);
  });

  it('downgrades HTTP evidence instead of treating it as fully verified', () => {
    const result = acceptedResult(
      validateToolResult(
        {
          ...baseResult,
          sources: [
            {
              ...baseResult.sources[0],
              url: 'http://www.ntu.edu.sg/admissions',
            },
          ],
        },
        { now: NOW },
      ),
    );

    expect(result.verification.status).toBe('needs_review');
    expect(result.verification.warnings.join(' ')).toMatch(/HTTPS/);
  });

  it('rejects malformed sources without retrieved_at', () => {
    const sourceWithoutRetrievedAt: Record<string, unknown> = {
      ...baseResult.sources[0],
    };
    delete sourceWithoutRetrievedAt.retrieved_at;
    const validation = validateToolResult(
      { ...baseResult, sources: [sourceWithoutRetrievedAt] },
      { now: NOW },
    );

    expect(validation.accepted).toBe(false);
    expect(validation.errors.join(' ')).toMatch(/retrieved_at/);
  });

  it('applies a Tool-configured freshness window', () => {
    const result = acceptedResult(
      validateToolResult(baseResult, {
        now: NOW,
        freshness: { maxAgeMs: 12 * 60 * 60 * 1000 },
      }),
    );

    expect(result.verification.status).toBe('stale');
    expect(result.verification.warnings.join(' ')).toMatch(/freshness window/);
  });

  it('keeps current evidence verified under its configured freshness window', () => {
    const result = acceptedResult(
      validateToolResult(baseResult, {
        now: NOW,
        freshness: { maxAgeMs: 2 * 24 * 60 * 60 * 1000 },
      }),
    );

    expect(result.verification.status).toBe('verified');
    expect(result.verification.checks).toContain('freshness_checked:source-1');
  });

  it('flags future source times for review', () => {
    const result = acceptedResult(
      validateToolResult(
        {
          ...baseResult,
          sources: [
            {
              ...baseResult.sources[0],
              retrieved_at: '2026-09-20T00:00:00.000Z',
            },
          ],
        },
        { now: NOW },
      ),
    );

    expect(result.verification.status).toBe('needs_review');
    expect(result.verification.warnings.join(' ')).toMatch(/future/);
  });

  it('checks a supplied publication time even without a freshness window', () => {
    const result = acceptedResult(
      validateToolResult(
        {
          ...baseResult,
          sources: [
            {
              ...baseResult.sources[0],
              published_at: '2026-09-20T00:00:00.000Z',
            },
          ],
        },
        { now: NOW },
      ),
    );

    expect(result.verification.status).toBe('needs_review');
    expect(result.verification.checks).toContain(
      'publication_time_present:source-1',
    );
    expect(result.verification.warnings.join(' ')).toMatch(
      /future publication/,
    );
  });

  it('surfaces declared conflicts without selecting a source', () => {
    const secondSource = {
      ...baseResult.sources[0],
      id: 'source-2',
      title: 'Second NTU source',
      url: 'https://www.ntu.edu.sg/students',
    };
    const result = acceptedResult(
      validateToolResult(
        { ...baseResult, sources: [...baseResult.sources, secondSource] },
        {
          now: NOW,
          freshness: { maxAgeMs: 12 * 60 * 60 * 1000 },
          conflicts: [
            {
              sourceIds: ['source-1', 'source-2'],
              description: 'The two pages publish different dates.',
            },
          ],
        },
      ),
    );

    expect(result.verification.status).toBe('conflict');
    expect(result.verification.warnings.join(' ')).toMatch(/different dates/);
  });

  it('rejects conflict metadata that references unknown evidence', () => {
    const validation = validateToolResult(baseResult, {
      now: NOW,
      conflicts: [
        {
          sourceIds: ['source-1', 'missing-source'],
          description: 'Synthetic conflict.',
        },
      ],
    });

    expect(validation.accepted).toBe(false);
    expect(validation.errors.join(' ')).toMatch(/unknown source/);
  });

  it('excludes locations whose coordinates are not verified', () => {
    const result = acceptedResult(
      validateToolResult(
        {
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
        },
        { now: NOW },
      ),
    );

    expect(result.locations).toEqual([]);
    expect(result.verification.status).toBe('needs_review');
    expect(result.verification.warnings.join(' ')).toMatch(
      /coordinates are not verified/,
    );
  });

  it('excludes locations that reference a missing source', () => {
    const result = acceptedResult(
      validateToolResult(
        {
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
              source_id: 'missing-source',
              coordinate_status: 'verified',
            },
          ],
        },
        { now: NOW },
      ),
    );

    expect(result.locations).toEqual([]);
    expect(result.verification.status).toBe('needs_review');
    expect(result.verification.warnings.join(' ')).toMatch(/source is missing/);
  });

  it('never upgrades a cautious Tool status or warning', () => {
    const result = acceptedResult(
      validateToolResult(
        {
          ...baseResult,
          verification: {
            ...baseResult.verification,
            status: 'needs_review',
            warnings: ['Manual review is still required.'],
          },
        },
        { now: NOW },
      ),
    );

    expect(result.verification.status).toBe('needs_review');
    expect(result.verification.warnings).toContain(
      'Manual review is still required.',
    );
  });

  it('requires official NTU evidence before a result can be verified', () => {
    const result = acceptedResult(
      validateToolResult(
        {
          ...baseResult,
          sources: [
            {
              ...baseResult.sources[0],
              url: 'https://www.openstreetmap.org/node/1',
              official: false,
            },
          ],
        },
        { now: NOW },
      ),
    );

    expect(result.verification.status).toBe('needs_review');
    expect(result.verification.warnings.join(' ')).toMatch(/No official NTU/);
  });

  it('rejects duplicate source IDs and invalid policy time', () => {
    const duplicateValidation = validateToolResult(
      { ...baseResult, sources: [...baseResult.sources, ...baseResult.sources] },
      { now: NOW },
    );
    const timeValidation = validateToolResult(baseResult, { now: 'not-a-date' });

    expect(duplicateValidation.accepted).toBe(false);
    expect(duplicateValidation.errors.join(' ')).toMatch(/duplicated/);
    expect(timeValidation.accepted).toBe(false);
    expect(timeValidation.errors.join(' ')).toMatch(/valid date-time/);
  });
});
