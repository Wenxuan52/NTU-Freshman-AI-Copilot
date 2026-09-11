# Trust Boundary Rules

This file applies under `src/trust/` and supplements the root `AGENTS.md`.

- Trust decisions are deterministic and explainable. Emit inspectable `checks` and `warnings` for source domain, freshness, conflicts, and coordinates.
- Use exact official-domain matching or an explicitly reviewed subdomain rule. Preserve publication and retrieval timestamps where applicable.
- Missing, stale, conflicting, or invalid evidence cannot be silently repaired. Return `needs_review` or `unavailable` according to the shared contract.
- A Verifier Agent may flag risks but cannot use model judgment to promote content to `verified`.
- Add trusted and untrusted boundary tests for every rule. Tests remain offline and use fixed fixtures.
- Changes to `src/contracts/*` require a dedicated Issue and simultaneous updates to all consumers, tests, and documentation.
