# Module Ownership and Delivery Entrypoints

Ownership is recorded per Issue, not assigned permanently to names. Members choose a direction using the [Team Plan](../planning/team-development-plan.md) interest table. Multiple contributors may split a direction, but all implementations use the shared contracts and trust rules.

## A. System Integration

Primary directories: `src/app/`, `src/agent/`, `src/components/`, `src/config/`, `src/tools/registry.ts`, and root configuration files.

Minimum delivery: connect frontend, Chat API, Main Agent, and Tools; maintain Context Panel and shared message rendering; handle loading, error, cancel, and partial results; keep `main` installable, testable, and buildable; integrate other modules without silently changing their Tool content.

## B. Freshman / Onboarding Tool

Primary directories: `src/tools/onboarding/`, `data/curated/onboarding/`, and corresponding tests and evals.

Minimum delivery: one Onboarding Tool using canonical `ToolResult`; an explicit input schema; traceable NTU official sources; one clear scope within matriculation, account activation, or orientation; defined failure behavior, source rules, tests, and representative questions.

## C. Student Services / Campus Life Tool

Primary directories: `src/tools/student-services/`, `data/curated/student-services/`, and corresponding tests and evals.

Minimum delivery: one Student Services Tool covering at least one area among counselling, wellbeing, student services, or campus resources; explicit sources, service location, and applicability; return `needs_review` or `unavailable` when evidence is insufficient.

## D. Food / Location

Primary directories: `src/tools/food-location/`, `src/components/map/`, `data/curated/locations/`, and corresponding tests and evals.

Minimum delivery: one Food / Location Tool using the shared `Location` schema; verified real coordinates with `source_id`; a basic Leaflet 2D marker; identical locations in chat results and map markers. The LLM must never guess, repair, or normalize coordinates.

## E. Academic / Latest Updates

Primary directories: `src/tools/academic-updates/`, `data/curated/academic/`, and corresponding tests and evals.

Minimum delivery: one Academic or Latest Updates Tool; retain `published_at` or `retrieved_at`; define an allowlist of official domains; handle stale information, source conflicts, and retrieval failure explicitly. Do not build a site-wide crawler.

## F. Trust & Evaluation

Primary directories: `src/trust/`, `src/contracts/`, `tests/`, and `evals/`.

Minimum delivery: deterministic source, time, conflict, and coordinate rules; benchmarks for the three MVP demo paths; trusted and untrusted boundary tests; explainable `checks` and `warnings`. A Verifier Agent may identify risk but may never use model judgment to upgrade content to `verified`.

## Shared-file coordination

The high-conflict set is `src/contracts/*`, `src/tools/registry.ts`, `src/agent/*`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `src/app/globals.css`, `.github/workflows/*`, and root `AGENTS.md`.

Contract changes require a dedicated Issue and simultaneous updates to all consumers, tests, and docs. Tool developers reuse the canonical `ToolResult`, `Source`, `Location`, and `Verification` definitions. Registry entries are added only after protocol tests pass. Lockfile changes require an explained package manifest change. The current System Integration owner coordinates competing shared-file edits and merge order.

## Optional work

Roadmap, Plan Lite, and the 3D Map remain voluntary explorations after the core MVP is complete. They must not be assigned as any member's mandatory core task.
