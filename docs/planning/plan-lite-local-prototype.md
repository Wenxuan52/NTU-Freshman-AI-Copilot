# Plan Lite / Personalized Map decision record

This repository copy summarizes the decisions recorded in Module Task
[Issue #7](https://github.com/Wenxuan52/NTU-Freshman-AI-Copilot/issues/7)
and the implementation prepared for review.

## 1. Task identity

- Direction: optional Plan Lite / Personalized Roadmap with map-linked tasks
- Core or optional: optional, post-MVP exploration
- Primary owner: `@QihangCao`
- Collaborators: System Integration review requested for shared wiring
- Task Issue: #7
- Planned branch: `feature/plan-lite-personalized-map`

## 2. Outcome and boundary

- Intended user outcome: receive a small, explainable first-month checklist
  based on non-sensitive profile choices and open relevant campus places on the
  existing map.
- Scope: deterministic profile rules, curated task templates, a typed Tool
  result, a dedicated checklist UI, local progress, and existing Leaflet map
  selection.
- Out of scope: full autonomous planning, accounts, server-side profiles,
  tracking, route optimization, live deadlines, 3D maps, and offline tiles.
- Minimum complete delivery: two distinct profiles produce different sourced
  plans; linked task locations select existing verified map markers.
- Owned directories: `src/tools/plan-lite/`, `src/components/plan/`,
  `data/curated/plan-lite/`, and corresponding tests/evals.

## 3. Representative user questions

1. I am an international undergraduate living on campus and arriving next
   week. Make me a Plan Lite for my first month.
2. I am a local postgraduate living off campus and already in my first week.
   What should I do next?

Requests for exact deadlines, legal immigration advice, live opening hours,
navigation, or a complete degree roadmap remain unsupported.

## 4. Interface decisions

- Tool: `planLite`, responsible only for deterministic template selection.
- Input: enumerated student level, residency, housing, arrival stage, and
  optional interests.
- Output: canonical Tool result fields plus a profile summary and typed plan
  items. Existing Source, Location, and Verification schemas are reused.
- UI: a profile starter sends a plain-language request; `PlanLiteCard` renders
  grouped tasks and map actions from the typed Tool part.
- Integration: one registry entry, Agent routing instructions, chat part
  allowlist, and typed message rendering.
- Compatibility: no existing canonical contract is changed.

## 5. Evidence and data decisions

- Sources: NTU official Freshmen, graduate guide, Student's Pass, housing,
  student life, library, and wellbeing pages. Existing curated OSM records are
  reused only for verified map coordinates.
- Provenance: URL, publisher, retrieval date, official flag, and review note
  are stored with the curated template data.
- Freshness: the prototype avoids exact dates and tells users to verify the
  current official page before acting.
- Conflicts: no rule silently chooses between conflicting sources.
- Coordinates: only existing `coordinate_status: verified` locations may be
  linked.

## 6. Failure and trust decisions

- Missing profile fields: the Agent asks for them before calling the Tool.
- Missing evidence or invalid references: deterministic validation rejects the
  result.
- Stale/conflicting information: exact deadlines are omitted and the result
  remains `needs_review`.
- User-visible behavior: the checklist always displays its warning and source
  links; it is labelled as a lightweight guide rather than official advice.

## 7. Shared files and dependencies

- Shared files: Tool registry, Agent instructions, chat request allowlist,
  page composition, and global styles.
- Contract work: one additive Plan Lite schema; no canonical schema mutation.
- Upstream dependency: current Food / Location map and curated locations.
- Downstream consumers: typed Agent messages, checklist UI, and Context Panel.

## 8. Acceptance and evidence plan

| Acceptance criterion | Planned implementation | Evidence |
| --- | --- | --- |
| Profiles produce different plans | deterministic template predicates | unit tests with two profiles |
| Every task has valid evidence | source reference refinement | invalid-reference test |
| Map links use verified locations | location reference refinement | map-linked plan test |
| Progress survives refresh | browser `localStorage` | manual UI review |
| Failures do not invent facts | strict Zod input and trust gate | malformed-input tests |
| Integration stays healthy | typed Tool part and dedicated component | typecheck, lint, test, build |

Automated tests do not call a model or network.

## 9. Unresolved decisions

None for this minimum delivery. The feature name is Plan Lite / Personalized
Map, and profile plus progress persistence remain browser-local. Accounts and
3D presentation are explicit future work.

## 10. Integration handoff

- Final changed files: Plan Lite Tool, schema, curated templates, tests/evals,
  typed UI, chat-first drawer, lion-guided tour, and shared integration files.
- Decision changes: the local prototype was approved for review; Issue #7 is
  now the source of truth and the feature name is resolved.
- Known limitations: no live deadlines, account sync, route optimization, 3D
  map, or official-advice claim.
- Remaining action: System Integration review and CI verification.
- Safe rollback: remove the additive registry entry and Plan Lite UI; canonical
  shared contracts and the existing Food / Location Tool remain unchanged.
