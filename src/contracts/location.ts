import { z } from 'zod';

export const CoordinateStatusSchema = z.enum(['verified', 'needs_review']);

export const LocationSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  description: z.string().trim().min(1),
  address: z.string().trim().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  opening_hours: z.string().trim().min(1).nullable(),
  source_id: z.string().trim().min(1),
  coordinate_status: CoordinateStatusSchema,
});

export type Location = z.infer<typeof LocationSchema>;
