import { describe, expect, it } from 'vitest';

import { PlanLiteResultSchema } from '@/contracts/plan-lite';
import {
  buildPlanLite,
  PlanLiteInputSchema,
} from '@/tools/plan-lite/plan-lite-tool';
import { validateToolResult } from '@/trust/validator';

const REVIEWED_AT = '2026-09-14T00:00:00.000Z';

describe('Plan Lite Tool', () => {
  it('requires the four explicit profile dimensions', () => {
    expect(PlanLiteInputSchema.safeParse({}).success).toBe(false);
    expect(
      PlanLiteInputSchema.safeParse({
        student_level: 'undergraduate',
        residency: 'international',
        housing: 'on_campus',
        arrival_stage: 'before_arrival',
      }).success,
    ).toBe(true);
  });

  it('builds an international undergraduate plan with selected interests', () => {
    const result = buildPlanLite(
      {
        student_level: 'undergraduate',
        residency: 'international',
        housing: 'on_campus',
        arrival_stage: 'before_arrival',
        interests: ['food', 'study'],
      },
      REVIEWED_AT,
    );
    const itemIds = result.items.map(item => item.id);

    expect(itemIds).toContain('review-undergraduate-guide');
    expect(itemIds).toContain('review-students-pass');
    expect(itemIds).toContain('review-undergraduate-housing');
    expect(itemIds).toContain('explore-campus-food');
    expect(itemIds).toContain('explore-library');
    expect(itemIds).not.toContain('review-graduate-guide');
    expect(result.locations).toHaveLength(3);
    expect(result.verification.status).toBe('needs_review');
  });

  it('does not include expired phases or unrelated profile rules', () => {
    const result = buildPlanLite(
      {
        student_level: 'postgraduate',
        residency: 'local',
        housing: 'off_campus',
        arrival_stage: 'first_week',
        interests: [],
      },
      REVIEWED_AT,
    );
    const itemIds = result.items.map(item => item.id);

    expect(itemIds).toEqual([
      'find-student-support',
      'save-wellbeing-support',
    ]);
    expect(result.locations).toEqual([]);
    expect(itemIds).not.toContain('review-students-pass');
    expect(itemIds).not.toContain('review-graduate-guide');
  });

  it('keeps every task and location reference traceable', () => {
    const result = buildPlanLite(
      {
        student_level: 'undergraduate',
        residency: 'international',
        housing: 'on_campus',
        arrival_stage: 'before_arrival',
        interests: ['food'],
      },
      REVIEWED_AT,
    );
    const sourceIds = new Set(result.sources.map(source => source.id));
    const locationIds = new Set(result.locations.map(location => location.id));

    for (const item of result.items) {
      expect(item.source_ids.every(sourceId => sourceIds.has(sourceId))).toBe(true);
      expect(
        item.location_ids.every(locationId => locationIds.has(locationId)),
      ).toBe(true);
    }

    expect(validateToolResult(result).accepted).toBe(true);
  });

  it('rejects a plan item that references unknown evidence', () => {
    const result = buildPlanLite(
      {
        student_level: 'postgraduate',
        residency: 'local',
        housing: 'off_campus',
        arrival_stage: 'first_week',
        interests: [],
      },
      REVIEWED_AT,
    );
    const invalidResult = structuredClone(result);
    invalidResult.items[0].source_ids = ['missing-source'];

    expect(PlanLiteResultSchema.safeParse(invalidResult).success).toBe(false);
  });
});
