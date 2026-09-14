import { z } from 'zod';

import { ToolResultSchema } from '@/contracts/tool-result';

export const StudentLevelSchema = z.enum(['undergraduate', 'postgraduate']);
export const ResidencySchema = z.enum(['local', 'international']);
export const HousingSchema = z.enum(['on_campus', 'off_campus', 'undecided']);
export const PlanPhaseSchema = z.enum([
  'before_arrival',
  'first_week',
  'first_month',
]);
export const PlanPrioritySchema = z.enum(['high', 'medium', 'low']);
export const PlanInterestSchema = z.enum([
  'food',
  'study',
  'wellbeing',
  'campus_life',
]);

export const PlanProfileSchema = z.object({
  student_level: StudentLevelSchema,
  residency: ResidencySchema,
  housing: HousingSchema,
  arrival_stage: PlanPhaseSchema,
  interests: z.array(PlanInterestSchema).max(4).default([]),
});

export const PlanItemSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  phase: PlanPhaseSchema,
  priority: PlanPrioritySchema,
  reason: z.string().trim().min(1),
  source_ids: z.array(z.string().trim().min(1)).min(1),
  location_ids: z.array(z.string().trim().min(1)).default([]),
});

const PlanLiteExtensionSchema = z.object({
  profile: PlanProfileSchema,
  items: z.array(PlanItemSchema).min(1).max(20),
});

export const PlanLiteResultSchema = ToolResultSchema.and(
  PlanLiteExtensionSchema,
).superRefine((result, context) => {
  const sourceIds = new Set(result.sources.map(source => source.id));
  const locationIds = new Set(result.locations.map(location => location.id));
  const itemIds = new Set<string>();

  for (const [index, item] of result.items.entries()) {
    if (itemIds.has(item.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['items', index, 'id'],
        message: 'Plan item IDs must be unique.',
      });
    }
    itemIds.add(item.id);

    for (const sourceId of item.source_ids) {
      if (!sourceIds.has(sourceId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items', index, 'source_ids'],
          message: `Plan item references unknown source ${sourceId}.`,
        });
      }
    }

    for (const locationId of item.location_ids) {
      if (!locationIds.has(locationId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items', index, 'location_ids'],
          message: `Plan item references unknown location ${locationId}.`,
        });
      }
    }
  }
});

export type PlanProfile = z.infer<typeof PlanProfileSchema>;
export type PlanInterest = z.infer<typeof PlanInterestSchema>;
export type PlanPhase = z.infer<typeof PlanPhaseSchema>;
export type PlanItem = z.infer<typeof PlanItemSchema>;
export type PlanLiteResult = z.infer<typeof PlanLiteResultSchema>;
