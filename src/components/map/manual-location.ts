import { z } from 'zod';

import { LocationSchema, type Location } from '@/contracts/location';

export const ManualLocationInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240),
  address: z.string().trim().min(2).max(240),
  latitude: z.coerce.number().finite().min(-90).max(90),
  longitude: z.coerce.number().finite().min(-180).max(180),
});

export type ManualLocationInput = {
  name: string;
  category: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
};

export function createManualLocation(
  input: unknown,
  id = `manual-${crypto.randomUUID()}`,
): Location {
  const parsed = ManualLocationInputSchema.parse(input);
  const location = {
    id,
    name: parsed.name,
    category: parsed.category,
    description: parsed.description || 'User-added map location.',
    address: parsed.address,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    opening_hours: null,
    source_id: 'manual-user-entry',
    coordinate_status: 'needs_review' as const,
  };

  return LocationSchema.parse(location);
}
