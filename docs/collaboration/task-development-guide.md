# Task Development Guide

Use this guide for every feature, fix, or documentation task. The root `AGENTS.md` remains authoritative for repository-wide engineering rules.

## 1. Choose and record the task

Review the interest table in the [Team Plan](../planning/team-development-plan.md), then create a Module Task Issue. Pick one of System Integration, Freshman / Onboarding, Student Services / Campus Life, Food / Location, Academic / Latest Updates, or Trust & Evaluation. Record a primary owner and any collaborators without treating the direction as permanent personal ownership.

If several members choose the same direction, split it into independently reviewable sub-tasks and keep the same shared contracts. Roadmap, Plan Lite, and the 3D Map are voluntary work only after core MVP acceptance.

## 2. Branch from current main

Start from the latest reviewed `main` and use exactly one branch category:

```text
feature/<module-name>
fix/<problem-name>
docs/<topic>
```

Do not force-push shared branches. Rebase or merge only according to the team's agreed Git workflow, and ask the System Integration owner to sequence conflicting shared-file changes.

## 3. Work inside the module boundary

Read the root and nearest module `AGENTS.md`. Implement the minimum complete behavior in the directories listed in [Module Ownership](module-ownership.md). Reuse `ToolResult`, `Source`, `Location`, and `Verification` from `src/contracts/`.

Do not bundle unrelated cleanup into the PR. Do not modify another module's content merely to make integration convenient. Put small, source-traceable curated records under the direction's `data/curated/` directory.

## 4. Protect shared interfaces

High-conflict shared files are `src/contracts/*`, `src/tools/registry.ts`, `src/agent/*`, the package and workspace manifests and lockfile, `src/app/globals.css`, `.github/workflows/*`, and root `AGENTS.md`.

- Create a dedicated Issue before a Contract change.
- Update all consumers, tests, and documentation together.
- Register a Tool only after its schema and protocol tests pass.
- Explain every lockfile diff with the matching package manifest change.
- Let the System Integration owner coordinate simultaneous edits.

## 5. Prove the behavior

Each Tool task includes unit tests, trust-boundary tests, failure behavior, and at least two representative questions in `evals/`. Tests must use fixtures, mocks, or dependency injection and must not call a real model, provider, NTU site, or other network service.

Run:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test:run
pnpm build
pnpm lint
```

The final lint is deliberate: it proves that Next.js-generated files do not break the repository lint policy.

## 6. Request review

Use the PR template to disclose Scope, Files, Contracts, Sources, Tests, and Limitations. Link the task Issue and list blockers or follow-ups. All changes merge through a PR and the `verify` CI check must pass. The required approving review count is currently zero, so the project owner may merge their own PR after CI succeeds.

Never commit credentials, `.env.local`, private information, raw large datasets, dependency directories, or generated builds.

## 7. GitHub onboarding

Collect each member's exact GitHub username, then have the project owner add them individually as a **Write** collaborator. Do not grant Admin or Maintain permission and do not create placeholder invitations. After joining, a member first records their interest direction in the team process, then creates a Module Task Issue before starting a branch.
