# Module Decision Record

Complete this record in the Module Task Issue before implementation. It is the shared specification for the module owner, collaborators, Coding Agent, reviewer, and System Integration owner. Keep it concise, but do not leave product behavior implicit.

## 1. Task identity

- Direction:
- Core or optional:
- Primary owner:
- Collaborators:
- Task Issue:
- Planned branch:

## 2. Outcome and boundary

- Intended user outcome:
- Scope:
- Out of scope:
- Minimum complete delivery:
- Owned directories:

## 3. Representative user questions

List the questions this delivery must handle. Tool work requires at least two eval questions.

1.
2.

Also state important questions that must remain unsupported or return a safe failure.

## 4. Interface decisions

- Tool or component name and responsibility:
- Input schema and constraints:
- Output fields and shared contracts used:
- Expected UI or Agent behavior:
- Registry, routing, or other integration required:
- Compatibility assumptions:

Do not redefine `ToolResult`, `Source`, `Location`, or `Verification` inside a module.

## 5. Evidence and data decisions

- Allowed official sources or domains:
- Required provenance fields:
- Publication, retrieval, or freshness rule:
- Source-conflict behavior:
- Location and coordinate evidence, if applicable:
- Curated data files and update method:

Write N/A only when the task has no factual or data dependency.

## 6. Failure and trust decisions

- Missing input:
- Missing or unreachable evidence:
- Stale information:
- Conflicting sources:
- Invalid location or coordinate:
- Provider, Tool, or integration failure:
- Conditions for `verified`, `needs_review`, and `unavailable`:
- User-visible warning or error behavior:

The deterministic validator decides trust status. A model may identify risk but may not promote content to `verified`.

## 7. Shared files and dependencies

- Shared files touched:
- Why each shared-file change is required:
- Contract Issue, when applicable:
- Upstream dependencies and owners:
- Downstream consumers:
- Integration owner and proposed merge order:

Write None when no shared file is needed. Do not include opportunistic refactoring.

## 8. Acceptance and evidence plan

Every acceptance criterion must have implementation and verification evidence.

| Acceptance criterion | Planned implementation | Test or review evidence |
| --- | --- | --- |
|  |  |  |

Include unit tests, trust-boundary tests, failure tests, representative eval questions, and any necessary UI review. Automated tests must not call a real model or network.

## 9. Unresolved decisions

For every unresolved item, state:

- question;
- decision owner;
- deadline or blocking condition;
- options considered;
- whether implementation can safely proceed without it.

Write None only when no material decision remains. Coding Agents must not silently choose an unresolved product, Contract, Demo, or cross-module behavior.

## 10. Integration handoff

Complete this section before requesting review:

- Final changed files:
- Decision changes made during implementation:
- Checks and test results:
- Delivered eval questions:
- Known limitations and deferred work:
- Registry, Agent, UI, data migration, or deployment action still required:
- Safe rollback or disable behavior:

The task Issue must reflect the delivered behavior so the System Integration owner can provide this record directly to a Coding Agent for final integration and acceptance review.
