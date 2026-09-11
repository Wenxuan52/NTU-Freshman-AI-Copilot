# Task Development Guide

Use this guide for every feature, fix, or documentation task. The root `AGENTS.md` remains authoritative for repository-wide engineering rules.

## 1. Choose and record the task

Review the interest table in the [Team Plan](../planning/team-development-plan.md), then create a Module Task Issue. Pick one of System Integration, Freshman / Onboarding, Student Services / Campus Life, Food / Location, Academic / Latest Updates, or Trust & Evaluation. Record a primary owner and any collaborators without treating the direction as permanent personal ownership.

If several members choose the same direction, split it into independently reviewable sub-tasks and keep the same shared contracts. Roadmap, Plan Lite, and the 3D Map are voluntary work only after core MVP acceptance.

## 2. Pass the Decision Gate

Before creating implementation code, complete every required section of the [Module Decision Record](module-decision-template.md) in the Module Task Issue. Record:

- outcome, scope, and out of scope;
- representative user questions;
- Tool or component inputs, outputs, and shared contracts;
- official sources, freshness, location, and provenance rules where applicable;
- failure behavior and deterministic trust status;
- UI and integration behavior;
- owned directories, shared files, dependencies, and merge order;
- acceptance criteria, tests, eval questions, and evidence;
- unresolved decisions, their owner, and whether they block implementation.

The Decision Gate passes when the required fields are concrete enough for another member or Coding Agent to implement and test without inventing product behavior. The System Integration owner coordinates any proposed shared-file edit before parallel work starts. A module owner may resolve decisions inside the agreed module boundary; product-wide, Contract, Demo, or cross-module decisions must be surfaced for team or Integration confirmation.

If an accepted decision changes, update the Issue before or with the code change and explain the change in the PR. The code must not become the only source of that decision.

## 3. Branch from current main

Start from the latest reviewed `main` and use exactly one branch category:

```text
feature/<module-name>
fix/<problem-name>
docs/<topic>
```

Do not force-push shared branches. Rebase or merge only according to the team's agreed Git workflow, and ask the System Integration owner to sequence conflicting shared-file changes.

## 4. Work inside the module boundary

Read the root and nearest module `AGENTS.md`. Implement the minimum complete behavior in the directories listed in [Module Ownership](module-ownership.md). Reuse `ToolResult`, `Source`, `Location`, and `Verification` from `src/contracts/`.

Do not bundle unrelated cleanup into the PR. Do not modify another module's content merely to make integration convenient. Put small, source-traceable curated records under the direction's `data/curated/` directory.

## 5. Protect shared interfaces

High-conflict shared files are `src/contracts/*`, `src/tools/registry.ts`, `src/agent/*`, the package and workspace manifests and lockfile, `src/app/globals.css`, `.github/workflows/*`, and root `AGENTS.md`.

- Create a dedicated Issue before a Contract change.
- Update all consumers, tests, and documentation together.
- Register a Tool only after its schema and protocol tests pass.
- Explain every lockfile diff with the matching package manifest change.
- Let the System Integration owner coordinate simultaneous edits.

## 6. Prove the behavior

Each Tool task includes unit tests, trust-boundary tests, failure behavior, and at least two representative questions in `evals/`. Tests must use fixtures, mocks, or dependency injection and must not call a real model, provider, NTU site, or other network service.

Maintain decision traceability while implementing: each acceptance criterion must point to the implementing files and the test or review evidence that proves it. If a criterion is not delivered, mark it as a limitation rather than silently treating it as complete.

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

## 7. Prepare the integration handoff

Before opening the PR, update the task Issue with the final changed-file list, decision changes, test results, known limitations, unresolved decisions, and any required registry or UI wiring. This completed record is the structured handoff that the System Integration owner can give to a Coding Agent for repository-wide integration.

Do not ask Integration to infer module behavior from source code alone. The handoff must distinguish implemented behavior, tested evidence, deferred work, and decisions that still require a person.

## 8. Request review

Use the PR template to link the task Issue and map decisions and acceptance criteria to implementation and evidence. Disclose Scope, Files, Contracts, Sources, Tests, decision changes, unresolved items, and Limitations. All changes merge through a PR and the `verify` CI check must pass. The required approving review count is currently zero, so the project owner may merge their own PR after CI succeeds.

Never commit credentials, `.env.local`, private information, raw large datasets, dependency directories, or generated builds.

## 9. GitHub onboarding

Collect each member's exact GitHub username, then have the project owner add them individually as a **Write** collaborator. Do not grant Admin or Maintain permission and do not create placeholder invitations. After joining, a member first records their interest direction in the team process, then creates a Module Task Issue before starting a branch.
