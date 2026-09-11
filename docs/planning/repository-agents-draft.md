# AGENTS.md

## 1. Scope

This file applies to the entire repository.

This repository contains the product code for **NTU Freshman AI Copilot**. It is not a fork-development workspace for Vercel AI SDK. Use the published AI SDK packages as dependencies; do not copy or modify AI SDK internals unless a separate architecture decision explicitly requires it.

## 2. Product Purpose

NTU Freshman AI Copilot helps new NTU students understand:

- what they need to do;
- when they need to do it;
- where they can find a service or location;
- which official source supports the answer.

The product is a focused onboarding and campus-information assistant, not a general-purpose chatbot that claims to know everything about NTU.

The coordination source of truth is the team Notion page:

- [Team Plan](https://app.notion.com/p/3d8ee8d59e5d819090e8f4bf341470d3)

The repository is the source of truth for code, technical contracts, tests, and curated runtime data.

## 3. Current MVP

The first release must demonstrate three reliable user flows:

1. **Freshman onboarding question** → actionable answer with official sources;
2. **Campus location question** → answer plus structured locations and a 2D map;
3. **Latest information question** → answer with freshness and trust checks.

The minimum vertical slice is:

```text
Frontend
→ Next.js API Route
→ Main ToolLoopAgent
→ Mock Tool
→ Trust Validator
→ Answer + Sources
```

Optional work after the core MVP:

- Plan Lite / Personalized Roadmap;
- 3D Campus Map;
- advanced RAG;
- additional schools and information domains.

Do not prioritize full autonomous planning, 3D mapping, multi-agent orchestration, fine-tuning, portal login automation, form submission, or production-grade user accounts before the core MVP is stable.

## 4. Architecture Principles

Use **one Main Agent with modular Tools**.

```text
User Interface
→ Chat API
→ Main Agent
→ Tool Registry
→ Domain Tool
→ Deterministic Trust Validator
→ Tool Result returned to Main Agent
→ Final Answer
→ Sources / Map / Context Panel
```

Rules:

- Domain capabilities are Tools, not separate autonomous agents.
- The Main Agent selects Tools and composes the final answer.
- Tools retrieve or read facts and return structured evidence.
- The trust validator runs deterministically for every factual Tool result. The model must not decide whether validation is needed.
- The UI renders structured Tool parts. Do not infer locations or sources by parsing generated prose.
- Do not expose or persist private chain-of-thought. Store only user-visible text, Tool calls/results, errors, timing, and safe telemetry.
- Tool loops must have a finite stop condition. Use a maximum of 4–6 model steps for the MVP.
- All external calls need timeouts, abort handling, and user-safe error messages.

## 5. Technical Baseline

Use:

- Next.js App Router;
- React and TypeScript in strict mode;
- Vercel AI SDK `ToolLoopAgent`;
- `@ai-sdk/react` for the chat UI;
- a provider package selected through configuration;
- Zod for request, Tool input, Tool output, and configuration validation;
- Leaflet + OpenStreetMap for the MVP map;
- Vitest for unit and contract tests;
- Playwright only where browser-level coverage is materially useful;
- pnpm with a committed lockfile.

Model and provider settings must be centralized under `src/config/`. Do not hardcode a model name inside an Agent or Tool.

Expected local environment variables include:

```text
OPENAI_API_KEY=
OPENAI_MODEL=
```

If a different provider is adopted, update `.env.example`, configuration validation, README, and tests together. Never commit `.env`, `.env.local`, API keys, tokens, passwords, or private credentials.

## 6. Repository Layout

Use this structure unless an accepted architecture decision changes it:

```text
src/
├── app/
│   ├── api/chat/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── agent/
│   ├── main-agent.ts
│   └── instructions.ts
├── components/
│   ├── chat/
│   ├── context-panel/
│   ├── map/
│   └── sources/
├── config/
│   ├── ai.ts
│   └── env.ts
├── contracts/
│   ├── location.ts
│   ├── source.ts
│   ├── tool-result.ts
│   └── verification.ts
├── tools/
│   ├── registry.ts
│   ├── mock/
│   ├── onboarding/
│   ├── student-services/
│   ├── food-location/
│   └── academic-updates/
└── trust/
    ├── official-domains.ts
    └── validator.ts
data/
└── curated/
evals/
docs/
public/
tests/
```

Do not create empty directories only to match this diagram. Add a directory when its first real implementation, test, schema, or scoped README is added.

Responsibilities:

- `src/app`: routes, page composition, and API boundaries;
- `src/agent`: Main Agent configuration and instructions;
- `src/tools`: domain Tool implementations and the central registry;
- `src/contracts`: shared Zod schemas and inferred TypeScript types;
- `src/trust`: deterministic validation and source policy;
- `src/components`: presentation only; no retrieval logic;
- `data/curated`: small, reviewed data required at runtime;
- `evals`: benchmark questions, expected Tool routing, and quality checks;
- `docs`: technical decisions and contributor documentation;
- `tests`: cross-module integration tests and shared fixtures.

## 7. Tool Contract

All factual Tools must return the shared `ToolResult` contract from `src/contracts/tool-result.ts`.

Conceptual shape:

```json
{
  "content": "Factual content returned by the Tool",
  "sources": [
    {
      "id": "source-1",
      "title": "NTU Official Source",
      "url": "https://www.ntu.edu.sg/...",
      "publisher": "Nanyang Technological University",
      "published_at": null,
      "retrieved_at": "2026-09-11T00:00:00Z",
      "official": true
    }
  ],
  "locations": [],
  "verification": {
    "status": "verified",
    "checks": ["official_source", "url_present", "freshness_checked"],
    "warnings": [],
    "reviewed_at": "2026-09-11T00:00:00Z"
  }
}
```

Contract rules:

- Validate Tool inputs before execution.
- Validate Tool outputs before returning them to the Main Agent.
- Use one canonical schema; do not redefine similar result types inside individual Tools.
- `content` must distinguish retrieved facts from explanation.
- Every factual Tool response must include at least one source or explicitly return `needs_review` / `unavailable`.
- Timestamps must be ISO 8601 strings.
- `locations` defaults to an empty array when not applicable.
- Do not represent unknown values with invented placeholders. Use `null`, an empty collection, or an explicit verification warning as defined by the schema.
- Tool errors must be structured and must not leak credentials, raw stack traces, or private content to the client.

Each Tool must document:

- name and description;
- intended questions;
- input schema;
- output behavior;
- source policy;
- failure behavior;
- minimum test questions.

## 8. Location Contract

Location-bearing results use the shared Location schema.

Conceptual shape:

```json
{
  "id": "north-spine-food-court",
  "name": "North Spine Food Court",
  "category": "Dining",
  "description": "Food options near North Spine.",
  "address": "NTU, Singapore",
  "latitude": 1.000000,
  "longitude": 103.000000,
  "opening_hours": null,
  "source_id": "source-1",
  "coordinate_status": "verified"
}
```

Rules:

- Latitude must be within `[-90, 90]`; longitude within `[-180, 180]`.
- Coordinates must come from a trusted source or documented manual review.
- The LLM must never invent, estimate, or repair coordinates.
- Every location must reference a source present in the same Tool result.
- `needs_review` locations must not be included in the formal Demo dataset.
- Map components consume Location objects directly; do not extract coordinates from answer text.

## 9. Trust and Source Policy

The trust layer is a mandatory backend gate for factual Tool results.

Minimum checks:

1. source exists;
2. URL parses successfully and uses an allowed protocol;
3. official-domain classification uses exact hostname or safe subdomain matching;
4. retrieval or publication time is present where freshness matters;
5. conflicting sources are not silently collapsed into one fact;
6. location coordinates have documented evidence;
7. the final answer cites only sources returned by Tools;
8. missing or weak evidence is surfaced as `needs_review`, `stale`, `conflict`, or `unavailable`.

Never classify a URL as official using substring matching. For example, `ntu.edu.sg.evil.example` is not an NTU domain.

Maintain official-domain configuration in one reviewed file. Do not scatter allowlists through Tool code.

A semantic verifier model may flag possible contradiction or unsupported claims, but it cannot independently promote content to `verified`. Deterministic checks and traceable evidence remain required.

## 10. Data Boundary

Commit only small, reviewed, reproducible data needed by the running application.

Allowed in the repository:

- curated Markdown or JSON;
- schemas and loaders;
- small test fixtures;
- benchmark questions;
- source registry entries with provenance;
- license and attribution records.

Keep outside the repository:

- bulk website captures;
- raw or uncleaned data;
- large map datasets;
- temporary research files;
- private meeting notes;
- complete Notion exports;
- sensitive or personal information;
- generated build outputs.

Before adding external data, record its source, retrieval date, license, expected freshness, and review status. Do not add data when reuse rights are unclear.

## 11. URL and Retrieval Safety

- Prefer NTU official sources for factual answers.
- Use HTTPS unless a reviewed source requires otherwise.
- Validate URLs server-side before fetching.
- Use exact-domain or subdomain checks, request timeouts, response-size limits, and safe redirect handling.
- Do not allow arbitrary client-provided URLs to reach internal networks.
- Do not build a broad crawler for the MVP.
- New retrieval sources require a source-policy update and tests.

## 12. Adding a Tool

When adding a new Tool:

1. confirm that it belongs to the agreed MVP or an approved optional scope;
2. reuse the shared input/output contracts;
3. place it in the correct domain folder;
4. write a precise description so the Main Agent can route correctly;
5. implement deterministic source and error handling;
6. pass the result through the trust validator;
7. register it once in `src/tools/registry.ts`;
8. add unit tests and representative evaluation questions;
9. add UI handling only if the Tool returns a new structured part;
10. update technical documentation when the contract or architecture changes.

Do not create a second Main Agent for a domain Tool.

## 13. Frontend Rules

- Keep Chat and Context Panel separate.
- Render text, source cards, Tool status, and location data from typed message parts.
- Location questions open or update the Map view.
- General factual questions show Sources.
- Optional Plan Lite results use a dedicated typed component.
- Always render loading, empty, error, and partial-result states.
- Do not hide trust warnings.
- Keep the MVP readable on common laptop widths before adding visual complexity.
- 3D assets must remain optional and must not block the core interface.

## 14. API Rules

- Validate request bodies with Zod.
- Do not accept arbitrary client-supplied system instructions.
- Enforce message-size, timeout, and Tool-loop limits.
- Keep provider calls on the server.
- Support request cancellation.
- Return user-safe errors with stable machine-readable codes.
- Do not log secrets or complete sensitive user messages.
- Unit tests must not make live model or network calls.

## 15. Code Conventions

- TypeScript strict mode is required.
- Prefer small modules with explicit responsibilities.
- Use `kebab-case` filenames.
- Use `PascalCase` for React components and types; use `camelCase` for functions and local variables.
- Preserve the API field names defined by shared contracts, including intentional `snake_case` fields.
- Avoid `any`; use `unknown` plus validation at untrusted boundaries.
- Avoid non-null assertions unless the invariant is immediately proved.
- Keep server-only code out of client bundles.
- Do not duplicate schemas or source lists.
- Do not add a dependency when the platform or existing dependency already provides the capability.
- Explain non-obvious behavior in comments; do not narrate obvious code.

## 16. Commands

The repository must provide these scripts in `package.json`:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:run
```

Keep the README synchronized with actual commands. If a command changes, update `package.json`, README, CI, and this file together.

## 17. Testing and Definition of Done

At minimum, test:

- Tool input validation;
- Tool output validation;
- official-domain matching;
- missing sources;
- stale or conflicting evidence;
- invalid or unverified coordinates;
- Tool routing for representative questions;
- Tool failure and timeout behavior;
- UI rendering of text, sources, and Tool errors.

A change is done when:

- the requested behavior works;
- relevant tests pass;
- type checking and linting pass;
- the production build succeeds for integration changes;
- documentation and `.env.example` are current;
- no secrets, raw data, or generated artifacts are added;
- the PR explains scope, verification, and remaining limitations.

Do not use live LLM calls as the only test. Use deterministic mocks and fixtures for automated checks.

## 18. Git and Team Collaboration

Keep `main` runnable.

Recommended flow:

```text
feature branch
→ Pull Request
→ Review
→ Merge
```

Branch examples:

- `feature/onboarding-tool`;
- `feature/location-map`;
- `feature/trust-validator`;
- `fix/tool-timeout`;
- `docs/tool-contract`.

Commit prefixes may use `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, and `chore:`.

Collaboration rules:

- respect the task interests recorded in the Team Plan;
- agree on contracts before parallel implementation;
- keep PRs focused and reviewable;
- do not silently change another module's public contract;
- contract changes require corresponding updates to consumers and tests;
- coordinate shared-file edits, especially the Tool registry, schemas, and Main Agent;
- do not force-push shared branches;
- do not change Git remotes or repository visibility without explicit owner approval.

## 19. Architecture Decisions

Record material technical decisions under `docs/decisions/` when they affect multiple contributors or are difficult to reverse.

Use a short ADR containing:

- context;
- decision;
- alternatives considered;
- consequences;
- status and date.

Examples requiring an ADR:

- changing the Agent framework;
- adding a Python service or database;
- adopting a vector store;
- changing the shared Tool contract;
- adding authentication;
- making 3D Map part of the required MVP.

## 20. Instructions for Coding Agents

Before editing:

1. read this file and any closer `AGENTS.md`;
2. inspect `git status` and preserve unrelated user changes;
3. inspect the relevant contract, tests, and consuming code;
4. state assumptions when the request is ambiguous.

While editing:

- make the smallest complete change;
- keep changes inside the requested module and its necessary consumers;
- update tests with behavior changes;
- preserve secrets and local-only data;
- prefer existing patterns over introducing parallel abstractions.

Before finishing:

- run the narrowest relevant tests first;
- run typecheck and lint for code changes;
- run the production build for cross-cutting changes;
- report exactly what changed, what was verified, and what remains unresolved.

Coding agents must not, without explicit user authorization:

- delete or overwrite the repository or broad directories;
- rewrite Git history;
- force-push;
- change remotes;
- create or connect a production deployment;
- add paid services;
- add credentials;
- scrape websites at scale;
- broaden the MVP into Roadmap, 3D Map, authentication, or multi-agent work.

## 21. Licensing and Attribution

The architecture is informed by Vercel AI SDK and its `examples/next-agent` example. Use published packages whenever possible.

If source code is copied or adapted:

- preserve applicable copyright and license notices;
- include the relevant Apache-2.0 license or attribution;
- record the upstream repository and source commit in `THIRD_PARTY_NOTICES.md`;
- do not imply that the product is maintained or endorsed by Vercel.

