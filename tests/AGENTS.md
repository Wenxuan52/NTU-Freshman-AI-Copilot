# Test Rules

This file applies under `tests/` and supplements the root `AGENTS.md`.

- Tests must be deterministic, isolated, and safe to run without API keys. Never contact a real model, provider, NTU site, or other network endpoint.
- Use dependency injection, mocks, and small fixtures at provider and retrieval boundaries. Assert user-visible status codes and safe error bodies without snapshots of secrets or internal errors.
- Cover successful protocol paths as well as malformed input, limits, missing configuration, abort propagation, unavailable evidence, and trust boundaries.
- Tool work requires unit tests plus at least two representative questions in `evals/`. A registry entry requires passing schema and protocol tests.
- Run one file with `pnpm test:run tests/<file>.test.ts`; run the complete suite and build-before-lint sequence before review.
- Do not weaken assertions or global configuration to make a feature pass. Coordinate shared Contract changes through their dedicated Issue.
