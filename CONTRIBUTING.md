# Contributing

This repository is designed for six members to develop independent modules against one shared protocol. Select a direction from the interest table in the [Team Plan](docs/planning/team-development-plan.md); no direction is permanently assigned to a person.

## Standard workflow

1. Synchronize your local `main`, then create a branch from that latest state. Do not develop directly on a shared branch.
2. Use `feature/<module-name>`, `fix/<problem-name>`, or `docs/<topic>`.
3. Read the root `AGENTS.md`, the nearest module `AGENTS.md`, and the task Issue before editing.
4. Implement the smallest complete feature inside the owned module directories.
5. Reuse the contracts in `src/contracts/`; do not create module-local versions of shared result types.
6. Add unit tests and at least two representative questions under `evals/` for a Tool task.
7. Keep automated tests offline and deterministic: no real model calls, network requests, API keys, or live NTU pages.
8. Run the checks in CI order:

   ```bash
   pnpm install --frozen-lockfile
   pnpm typecheck
   pnpm lint
   pnpm test:run
   pnpm build
   pnpm lint
   ```

9. Open a PR using the template and complete Scope, Files, Contracts, Sources, Tests, and Limitations.
10. Merge only through a PR after required CI checks pass. This repository currently requires zero approving reviews, so the owner may merge their own green PR.
11. Never force-push a shared branch. Coordinate shared-file conflicts with the System Integration owner.
12. Never commit API keys, tokens, `.env.local`, raw large datasets, private student information, `node_modules`, or build output.

## Tasks and ownership

Create a Module Task Issue before implementation. Record the primary owner and collaborators there; ownership is task-level, not permanent. Multiple people may split one direction into separate sub-tasks while using the same public contracts. The six core directions and their minimum deliverables are defined in [Module Ownership](docs/collaboration/module-ownership.md).

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
