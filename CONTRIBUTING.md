# Contributing

This repository is designed for six members to develop independent modules against one shared protocol. Select a direction from the interest table in the [Team Plan](docs/planning/team-development-plan.md); no direction is permanently assigned to a person.

## Standard workflow

1. Create a Module Task Issue and complete the [Module Decision Record](docs/collaboration/module-decision-template.md) before implementation. Do not leave a required decision implicit.
2. Resolve or explicitly mark open every product, interface, evidence, trust, and shared-file decision. The System Integration owner must coordinate any shared-file boundary before parallel implementation begins.
3. Synchronize your local `main`, then create `feature/<module-name>`, `fix/<problem-name>`, or `docs/<topic>` from that latest state. Do not develop directly on a shared branch.
4. Read the root `AGENTS.md`, the nearest module `AGENTS.md`, and the complete task Issue before editing. A Coding Agent must use the Issue as its implementation specification and must report any contradiction or missing blocking decision.
5. Implement the smallest complete feature inside the owned module directories without expanding the recorded scope.
6. Reuse the contracts in `src/contracts/`; do not create module-local versions of shared result types.
7. Add unit tests and at least two representative questions under `evals/` for a Tool task. Every acceptance criterion must map to implementation and test evidence.
8. Keep automated tests offline and deterministic: no real model calls, network requests, API keys, or live NTU pages.
9. Run the checks in CI order:

   ```bash
   pnpm install --frozen-lockfile
   pnpm typecheck
   pnpm lint
   pnpm test:run
   pnpm build
   pnpm lint
   ```

10. Open a PR using the template and complete Decision Traceability, Scope, Files, Contracts, Sources, Tests, and Limitations.
11. Merge only through a PR after required CI checks pass. This repository currently requires zero approving reviews, so the owner may merge their own green PR.
12. Never force-push a shared branch. Coordinate shared-file conflicts with the System Integration owner.
13. Never commit API keys, tokens, `.env.local`, raw large datasets, private student information, `node_modules`, or build output.

## Tasks and ownership

Create a Module Task Issue before implementation. Record the primary owner and collaborators there; ownership is task-level, not permanent. Complete all required decision fields using the [Module Decision Record](docs/collaboration/module-decision-template.md). If a decision is genuinely unresolved, name its owner, deadline or blocking condition, and whether implementation may safely proceed without it. Multiple people may split one direction into separate sub-tasks while using the same public contracts. The six core directions and their minimum deliverables are defined in [Module Ownership](docs/collaboration/module-ownership.md).

The decision record is the handoff contract between the module owner, Coding Agent, reviewer, and System Integration owner. Update it when an accepted decision changes; do not let the implementation become the only record of a decision.

Roadmap, Plan Lite, and the 3D Map are optional explorations after the core MVP. They are not mandatory assignments.

## Shared files

The following files have high merge-conflict or compatibility risk:

- `src/contracts/*`
- `src/tools/registry.ts`
- `src/agent/*`
- `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`
- `src/app/globals.css`
- `.github/workflows/*`
- root `AGENTS.md`

Open a dedicated Issue before changing a shared Contract. A Contract change must update every consumer, its tests, and its documentation in the same PR. Tool authors must reuse `ToolResult`, `Source`, `Location`, and `Verification`. The registry accepts a Tool only after its protocol tests pass. Do not mix unrelated refactoring into a feature PR. Every lockfile change must be explained by an intentional `package.json` change. If two contributors need the same shared file, the System Integration owner coordinates the merge order.

## Sources and data

Use traceable NTU official sources and store provenance fields required by the shared contracts. Curated records should be small, reviewable, and free of personal data. A Tool must return `needs_review` or `unavailable` when evidence is missing; an LLM cannot promote a result to `verified` or invent coordinates.

## Focused tests

Run one file while iterating:

```bash
pnpm test:run tests/mock-tool.test.ts
```

Before requesting review, run the complete CI sequence above.

## GitHub access

The project owner adds confirmed GitHub usernames individually with Write permission. Do not grant Admin or Maintain access. Direct pushes to `main` are prohibited: every change uses a feature branch and PR, and the `verify` check must pass before merge. Human approval is currently optional and the required approving review count is zero.
