# Curated NTU acronyms

`ntu-acronyms.json` is a small, manually reviewed directory for deterministic,
zero-token acronym lookup in the web interface.

- Official organisation names and abbreviations come from the
  [NTU A–Z Directory](https://www.ntu.edu.sg/footer/a-z-directory).
- Campus-place shorthand comes from visible labels in
  [NTU Maps](https://maps.ntu.edu.sg/).
- Retrieval and review date: 2026-09-16.
- Scope: school, college, institute, academy, and selected campus-place labels
  whose abbreviation is explicitly shown by one of the sources above.
- Reuse: the file records short factual names and identifiers only; it does not
  copy page descriptions, map tiles, coordinates, or other bulk site content.
- Freshness: this is a reviewed snapshot, not a live feed. The interface links
  users back to the official source and displays the review date.

Update method:

1. confirm the abbreviation and expansion are explicitly shown by an allowed
   official source;
2. omit conflicting or inferred entries until a manual review resolves them;
3. preserve stable `id` values and valid `source_id` references;
4. update `retrieved_at` and `reviewed_at`;
5. run `pnpm test:run`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
