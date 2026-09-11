import { z } from 'zod';

import { LocationSchema } from '@/contracts/location';
import { SourceSchema } from '@/contracts/source';
import { VerificationSchema } from '@/contracts/verification';

export const ToolResultSchema = z
  .object({
    content: z.string().trim().min(1),
    sources: z.array(SourceSchema),
    locations: z.array(LocationSchema).default([]),
    verification: VerificationSchema,
  })
  .superRefine((result, context) => {
    if (result.verification.status === 'verified' && result.sources.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sources'],
        message: 'Verified factual results require at least one source.',
      });
    }
  });

export type ToolResult = z.infer<typeof ToolResultSchema>;
