import { z } from 'zod';

import rawAcronymDirectory from '../../../data/curated/acronyms/ntu-acronyms.json';

const allowedSourceHosts = new Set(['www.ntu.edu.sg', 'maps.ntu.edu.sg']);

export const AcronymSourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z
    .string()
    .url()
    .refine(value => {
      const url = new URL(value);
      return url.protocol === 'https:' && allowedSourceHosts.has(url.hostname);
    }, 'Source must use HTTPS on an approved NTU hostname.'),
  publisher: z.literal('Nanyang Technological University'),
  retrieved_at: z.string().datetime(),
});

export const AcronymEntrySchema = z.object({
  id: z.string().min(1),
  acronym: z.string().min(2).max(20),
  name: z.string().min(2),
  category: z.enum([
    'Academy',
    'Campus place',
    'College',
    'Institute',
    'Research centre',
    'School',
  ]),
  aliases: z.array(z.string().min(2)),
  source_id: z.string().min(1),
});

export const AcronymDirectorySchema = z
  .object({
    reviewed_at: z.string().datetime(),
    sources: z.array(AcronymSourceSchema).min(1),
    acronyms: z.array(AcronymEntrySchema).min(1),
  })
  .superRefine((directory, context) => {
    const sourceIds = new Set(directory.sources.map(source => source.id));
    const ids = new Set<string>();
    const acronyms = new Set<string>();

    for (const [index, entry] of directory.acronyms.entries()) {
      if (ids.has(entry.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate acronym id: ${entry.id}`,
          path: ['acronyms', index, 'id'],
        });
      }
      ids.add(entry.id);

      const normalizedAcronym = normalizeAcronymText(entry.acronym);
      if (acronyms.has(normalizedAcronym)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate acronym: ${entry.acronym}`,
          path: ['acronyms', index, 'acronym'],
        });
      }
      acronyms.add(normalizedAcronym);

      if (!sourceIds.has(entry.source_id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unknown source_id: ${entry.source_id}`,
          path: ['acronyms', index, 'source_id'],
        });
      }
    }
  });

export type AcronymSource = z.infer<typeof AcronymSourceSchema>;
export type AcronymEntry = z.infer<typeof AcronymEntrySchema>;
export type AcronymDirectory = z.infer<typeof AcronymDirectorySchema>;

export function normalizeAcronymText(value: string) {
  return value
    .normalize('NFKD')
    .toLocaleLowerCase('en-SG')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function matchScore(entry: AcronymEntry, query: string) {
  const acronym = normalizeAcronymText(entry.acronym);
  const name = normalizeAcronymText(entry.name);
  const category = normalizeAcronymText(entry.category);
  const aliases = entry.aliases.map(normalizeAcronymText);

  if (acronym === query) return 0;
  if (acronym.startsWith(query)) return 1;
  if (name.startsWith(query)) return 2;
  if (aliases.some(alias => alias.startsWith(query))) return 3;
  if (name.includes(query)) return 4;
  if (aliases.some(alias => alias.includes(query))) return 5;
  if (category.includes(query)) return 6;
  return null;
}

export function filterAcronyms(entries: AcronymEntry[], query: string) {
  const normalizedQuery = normalizeAcronymText(query);
  if (!normalizedQuery) return entries;

  return entries
    .map((entry, index) => ({
      entry,
      index,
      score: matchScore(entry, normalizedQuery),
    }))
    .filter(
      (candidate): candidate is typeof candidate & { score: number } =>
        candidate.score !== null,
    )
    .sort((left, right) => left.score - right.score || left.index - right.index)
    .map(candidate => candidate.entry);
}

export function parseAcronymDirectory(input: unknown) {
  return AcronymDirectorySchema.parse(input);
}

export const acronymDirectory = parseAcronymDirectory(rawAcronymDirectory);
export const ACRONYM_COUNT = acronymDirectory.acronyms.length;
