# Curated Plan Lite templates

`plan-lite-templates.json` contains a small, reviewable set of deterministic
new-student checklist templates. It does not contain scraped pages or exact
deadlines.

- Source pages are owned and published by Nanyang Technological University.
- Source metadata and retrieval date are recorded in the JSON file.
- Retrieval date: 2026-09-14.
- Template wording is an original summary for this prototype, not copied page
  text.
- Review status: `needs_review`; users must confirm current requirements and
  dates on the linked official page before acting.
- Map-linked food tasks reuse the existing curated location file and its
  OpenStreetMap attribution and ODbL notice.

Update method: review each official source, update `retrieved_at`, revise the
summary only when supported, then run the Plan Lite unit and trust-boundary
tests. Do not add a task or location when its provenance or reuse terms are
unclear.
