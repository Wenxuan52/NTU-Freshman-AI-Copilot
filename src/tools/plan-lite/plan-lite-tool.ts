import { tool } from 'ai';
import { z } from 'zod';

import curatedLocationData from '../../../data/curated/locations/ntu-food-locations.json';
import curatedPlanData from '../../../data/curated/plan-lite/plan-lite-templates.json';
import { LocationSchema } from '@/contracts/location';
import {
  HousingSchema,
  PlanInterestSchema,
  PlanItemSchema,
  PlanLiteResultSchema,
  PlanProfileSchema,
  ResidencySchema,
  StudentLevelSchema,
  type PlanInterest,
  type PlanLiteResult,
  type PlanPhase,
  type PlanProfile,
} from '@/contracts/plan-lite';
import { SourceSchema } from '@/contracts/source';
import { validateToolResult } from '@/trust/validator';

export const PlanLiteInputSchema = PlanProfileSchema;

const ApplicabilitySchema = z.object({
  student_levels: z.array(StudentLevelSchema).optional(),
  residencies: z.array(ResidencySchema).optional(),
  housing: z.array(HousingSchema).optional(),
  interests: z.array(PlanInterestSchema).optional(),
});

const PlanTemplateSchema = PlanItemSchema.extend({
  applies_to: ApplicabilitySchema,
});

const CuratedPlanDataSchema = z.object({
  sources: z.array(SourceSchema).min(1),
  tasks: z.array(PlanTemplateSchema).min(1),
});

const CuratedLocationDataSchema = z.object({
  sources: z.array(SourceSchema).min(1),
  locations: z.array(LocationSchema).min(1),
});

const planData = CuratedPlanDataSchema.parse(curatedPlanData);
const locationData = CuratedLocationDataSchema.parse(curatedLocationData);

type PlanTemplate = z.infer<typeof PlanTemplateSchema>;

const phaseOrder: Record<PlanPhase, number> = {
  before_arrival: 0,
  first_week: 1,
  first_month: 2,
};

function matchesValue<T extends string>(
  allowed: T[] | undefined,
  value: T,
): boolean {
  return allowed === undefined || allowed.length === 0 || allowed.includes(value);
}

function matchesInterests(
  allowed: PlanInterest[] | undefined,
  interests: PlanInterest[],
): boolean {
  return (
    allowed === undefined ||
    allowed.length === 0 ||
    allowed.some(interest => interests.includes(interest))
  );
}

function templateApplies(template: PlanTemplate, profile: PlanProfile): boolean {
  const rules = template.applies_to;

  return (
    phaseOrder[template.phase] >= phaseOrder[profile.arrival_stage] &&
    matchesValue(rules.student_levels, profile.student_level) &&
    matchesValue(rules.residencies, profile.residency) &&
    matchesValue(rules.housing, profile.housing) &&
    matchesInterests(rules.interests, profile.interests)
  );
}

function withoutApplicability(template: PlanTemplate) {
  return PlanItemSchema.parse(template);
}

export function buildPlanLite(
  input: unknown,
  reviewedAt = new Date().toISOString(),
): PlanLiteResult {
  const profile = PlanLiteInputSchema.parse(input);
  const items = planData.tasks
    .filter(template => templateApplies(template, profile))
    .map(withoutApplicability);

  const selectedLocationIds = new Set(
    items.flatMap(item => item.location_ids),
  );
  const locations = locationData.locations.filter(location =>
    selectedLocationIds.has(location.id),
  );
  const selectedSourceIds = new Set(items.flatMap(item => item.source_ids));

  for (const location of locations) {
    selectedSourceIds.add(location.source_id);
  }

  const sources = [...planData.sources, ...locationData.sources].filter(
    (source, index, allSources) =>
      selectedSourceIds.has(source.id) &&
      allSources.findIndex(candidate => candidate.id === source.id) === index,
  );

  const candidate = PlanLiteResultSchema.parse({
    content: `Plan Lite selected ${items.length} source-backed tasks for this profile. It is a lightweight guide, not an official schedule.`,
    profile,
    items,
    sources,
    locations,
    verification: {
      status: 'needs_review',
      checks: [
        'profile_fields_valid',
        'deterministic_rules_applied',
        'plan_item_sources_present',
        'linked_locations_verified',
      ],
      warnings: [
        'Confirm current requirements and exact dates on the linked NTU pages before acting.',
      ],
      reviewed_at: reviewedAt,
    },
  });

  const trustValidation = validateToolResult(candidate, { now: reviewedAt });

  if (!trustValidation.accepted) {
    throw new Error('Plan Lite output failed deterministic trust validation.');
  }

  return PlanLiteResultSchema.parse({
    ...candidate,
    ...trustValidation.result,
  });
}

export async function executePlanLite(input: unknown): Promise<PlanLiteResult> {
  return buildPlanLite(input);
}

export const planLiteTool = tool({
  description:
    'Create a deterministic, source-backed Plan Lite checklist for a new NTU student. Required profile fields are student level, local or international residency, housing choice, and current arrival stage. Optional interests personalize map-linked food, study, wellbeing, and campus-life tasks. Ask the user for missing required fields instead of guessing them.',
  inputSchema: PlanLiteInputSchema,
  outputSchema: PlanLiteResultSchema,
  execute: executePlanLite,
});
