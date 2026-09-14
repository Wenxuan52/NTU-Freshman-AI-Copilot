# Curated location data

`ntu-food-locations.json` is a small reviewable fixture for the MVP Food / Location Tool.

- NTU context source: [NTU Student Support Campus Map](https://www3.ntu.edu.sg/isc2/apforms/SAO-StudentSupport-CampusMap.pdf).
- Coordinate sources: the linked OpenStreetMap records in the JSON file, retrieved on 2026-09-14.
- Map attribution: OpenStreetMap contributors. OpenStreetMap data is available under the [ODbL](https://www.openstreetmap.org/copyright).
- Freshness: venue names, addresses, and coordinates must be reviewed before a production demo; opening hours are intentionally `null`.
- Review status: coordinates are marked `verified` against the cited records, while the Tool result remains `needs_review` until venue details are checked against current NTU listings.
- Update method: replace a record only after checking the source URL, preserving the canonical `id`, `source_id`, retrieval date, and review status.
