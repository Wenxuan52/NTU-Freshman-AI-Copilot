import { tool } from 'ai';
import { z } from 'zod';

import curatedLocationData from '../../../data/curated/locations/ntu-food-locations.json';
import { LocationSchema } from '@/contracts/location';
import { SourceSchema } from '@/contracts/source';
import { ToolResultSchema, type ToolResult } from '@/contracts/tool-result';
import { validateToolResult } from '@/trust/validator';

const CuratedLocationDataSchema = z.object({
  sources: z.array(SourceSchema).min(1),
  locations: z.array(LocationSchema).min(1),
});

export const FoodLocationInputSchema = z.object({
  query: z.string().trim().min(2).max(300),
});

const curatedLocationDataParsed = CuratedLocationDataSchema.parse(
  curatedLocationData,
);

export async function executeFoodLocation(input: unknown): Promise<ToolResult> {
  const { query } = FoodLocationInputSchema.parse(input);
  const now = new Date().toISOString();
  const candidate: ToolResult = {
    content: `Curated food and campus locations relevant to “${query}”. Coordinates come from the linked OpenStreetMap records. Venue details and opening hours require manual confirmation before acting.`,
    sources: curatedLocationDataParsed.sources,
    locations: curatedLocationDataParsed.locations,
    verification: {
      status: 'needs_review',
      checks: [
        'source_present',
        'url_valid',
        'coordinate_source_present',
        'coordinates_verified_against_curated_records',
      ],
      warnings: [
        'Venue details and opening hours have not been manually verified against current NTU listings.',
      ],
      reviewed_at: now,
    },
  };

  const validation = validateToolResult(candidate);

  if (!validation.accepted) {
    throw new Error('Food Location Tool output failed deterministic trust validation.');
  }

  return ToolResultSchema.parse(validation.result);
}

export const foodLocationTool = tool({
  description:
    'Return curated NTU food and campus locations for questions about where to eat, cafes, restaurants, food courts, North Spine, or South Spine. Use the structured locations for the map and never invent coordinates.',
  inputSchema: FoodLocationInputSchema,
  outputSchema: ToolResultSchema,
  execute: executeFoodLocation,
});
