import { z } from 'zod';

export const SourceSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  url: z.string().url(),
  publisher: z.string().trim().min(1),
  published_at: z.string().datetime({ offset: true }).nullable(),
  retrieved_at: z.string().datetime({ offset: true }),
  official: z.boolean(),
});

export type Source = z.infer<typeof SourceSchema>;
