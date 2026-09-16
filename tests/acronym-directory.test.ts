import { describe, expect, it } from 'vitest';

import rawAcronymDirectory from '../data/curated/acronyms/ntu-acronyms.json';
import {
  acronymDirectory,
  filterAcronyms,
  parseAcronymDirectory,
} from '@/components/acronyms/acronym-directory';

describe('acronym directory', () => {
  it('accepts the curated snapshot and keeps every entry traceable', () => {
    const sourceIds = new Set(acronymDirectory.sources.map(source => source.id));

    expect(acronymDirectory.acronyms).toHaveLength(24);
    expect(
      acronymDirectory.acronyms.every(entry => sourceIds.has(entry.source_id)),
    ).toBe(true);
  });

  it('returns the full directory for an empty query', () => {
    expect(filterAcronyms(acronymDirectory.acronyms, '  ')).toEqual(
      acronymDirectory.acronyms,
    );
  });

  it('prioritises exact acronyms and ignores case', () => {
    const results = filterAcronyms(acronymDirectory.acronyms, 'mSe');

    expect(results[0]).toMatchObject({
      acronym: 'MSE',
      name: 'School of Materials Science and Engineering',
    });
  });

  it('matches full names, reviewed aliases, and categories', () => {
    expect(filterAcronyms(acronymDirectory.acronyms, 'north spine')[0]?.acronym).toBe(
      'NS',
    );
    expect(filterAcronyms(acronymDirectory.acronyms, 'computing')[0]?.acronym).toBe(
      'CCDS',
    );
    expect(filterAcronyms(acronymDirectory.acronyms, 'campus place')).toHaveLength(3);
  });

  it('returns no result instead of guessing an unknown acronym', () => {
    expect(filterAcronyms(acronymDirectory.acronyms, 'definitely-not-ntu')).toEqual(
      [],
    );
  });

  it('rejects duplicate acronyms and missing source references', () => {
    const duplicate = structuredClone(rawAcronymDirectory);
    duplicate.acronyms[1].acronym = duplicate.acronyms[0].acronym;

    const missingSource = structuredClone(rawAcronymDirectory);
    missingSource.acronyms[0].source_id = 'missing-source';

    expect(() => parseAcronymDirectory(duplicate)).toThrow(/Duplicate acronym/);
    expect(() => parseAcronymDirectory(missingSource)).toThrow(/Unknown source_id/);
  });
});
