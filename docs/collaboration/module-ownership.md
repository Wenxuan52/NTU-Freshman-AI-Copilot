# Module Ownership and Delivery Entrypoints

Ownership is recorded per Issue, not assigned permanently to names. Members choose a direction using the [Team Plan](../planning/team-development-plan.md) interest table. Multiple contributors may split a direction, but all implementations use the shared contracts and trust rules.

## A. System Integration

Primary directories: `src/app/`, `src/agent/`, `src/components/`, `src/config/`, `src/tools/registry.ts`, and root configuration files.

Minimum delivery: connect frontend, Chat API, Main Agent, and Tools; maintain Context Panel and shared message rendering; handle loading, error, cancel, and partial results; keep `main` installable, testable, and buildable; integrate other modules without silently changing their Tool content.

Decisions to record before implementation: routing and registry boundary; shared message and Tool-part rendering; loading, cancel, partial-result, and error states; integration order; compatibility expectations for every domain Tool; shared files that Integration will coordinate.

## B. Freshman / Onboarding Tool

Primary directories: `src/tools/onboarding/`, `data/curated/onboarding/`, and corresponding tests and evals.

Minimum delivery: one Onboarding Tool using canonical `ToolResult`; an explicit input schema; traceable NTU official sources; one clear scope within matriculation, account activation, or orientation; defined failure behavior, source rules, tests, and representative questions.

Decisions to record before implementation: the selected onboarding process and user stage; supported and unsupported questions; input constraints; official sources and freshness; required actions or deadlines; missing/conflicting evidence behavior; trust status and warnings; registry handoff.

## C. Student Services / Campus Life Tool

Primary directories: `src/tools/student-services/`, `data/curated/student-services/`, and corresponding tests and evals.

Minimum delivery: one Student Services Tool covering at least one area among counselling, wellbeing, student services, or campus resources; explicit sources, service location, and applicability; return `needs_review` or `unavailable` when evidence is insufficient.

Decisions to record before implementation: selected service category; target user and applicability limits; service location and contact fields; official source and freshness rules; sensitive or emergency-query boundary; missing-evidence behavior; trust status and user-visible warning.

## D. Food / Location

Primary directories: `src/tools/food-location/`, `src/components/map/`, `data/curated/locations/`, and corresponding tests and evals.

Minimum delivery: one Food / Location Tool using the shared `Location` schema; verified real coordinates with `source_id`; a basic Leaflet 2D marker; identical locations in chat results and map markers. The LLM must never guess, repair, or normalize coordinates.

Decisions to record before implementation: supported place and food queries; coordinate source and human-verification method; canonical location identifiers; map marker and selection behavior; chat-to-map consistency rule; invalid or missing coordinate behavior; ownership boundary between Tool data and map UI.

## E. Academic / Latest Updates

Primary directories: `src/tools/academic-updates/`, `data/curated/academic/`, and corresponding tests and evals.

Minimum delivery: one Academic or Latest Updates Tool; retain `published_at` or `retrieved_at`; define an allowlist of official domains; handle stale information, source conflicts, and retrieval failure explicitly. Do not build a site-wide crawler.

Decisions to record before implementation: selected academic or update scope; allowed domains and retrieval method; freshness threshold; publication versus retrieval timestamps; stale/conflicting source behavior; retrieval failure; what is deliberately excluded from crawling or summarization.

## F. Trust & Evaluation

Primary directories: `src/trust/`, `src/contracts/`, `tests/`, and `evals/`.

Minimum delivery: deterministic source, time, conflict, and coordinate rules; benchmarks for the three MVP demo paths; trusted and untrusted boundary tests; explainable `checks` and `warnings`. A Verifier Agent may identify risk but may never use model judgment to upgrade content to `verified`.

Decisions to record before implementation: deterministic rule inputs and outputs; exact conditions for each verification status; freshness and conflict thresholds; coordinate-evidence rules; benchmark questions and expected outcomes; warning vocabulary; how new domain Tools prove compliance without weakening shared trust rules.

## Shared-file coordination

The high-conflict set is `src/contracts/*`, `src/tools/registry.ts`, `src/agent/*`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `src/app/globals.css`, `.github/workflows/*`, and root `AGENTS.md`.

Contract changes require a dedicated Issue and simultaneous updates to all consumers, tests, and docs. Tool developers reuse the canonical `ToolResult`, `Source`, `Location`, and `Verification` definitions. Registry entries are added only after protocol tests pass. Lockfile changes require an explained package manifest change. The current System Integration owner coordinates competing shared-file edits and merge order.

Every direction completes the [Module Decision Record](module-decision-template.md) in its Module Task Issue before implementation. Direction-specific decisions above supplement the common template; they do not replace it.

## Optional work

Roadmap, Plan Lite, and the 3D Map remain voluntary explorations after the core MVP is complete. They must not be assigned as any member's mandatory core task.
