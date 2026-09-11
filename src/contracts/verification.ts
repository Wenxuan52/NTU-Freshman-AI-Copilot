import { z } from 'zod';

export const VerificationStatusSchema = z.enum([
  'verified',
  'needs_review',
  'stale',
  'conflict',
  'unavailable',
]);

export const VerificationSchema = z.object({
  status: VerificationStatusSchema,
  checks: z.array(z.string().trim().min(1)),
  warnings: z.array(z.string().trim().min(1)),
  reviewed_at: z.string().datetime({ offset: true }),
});

export type Verification = z.infer<typeof VerificationSchema>;
