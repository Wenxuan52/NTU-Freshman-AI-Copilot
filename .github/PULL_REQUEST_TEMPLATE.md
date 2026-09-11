## Scope

<!-- Link the Module Task Issue and state the smallest complete outcome. -->

## Decision traceability

<!-- For each acceptance criterion, link or name the recorded decision, implementing files, and test/review evidence. State any decision changed during implementation and confirm the task Issue was updated. -->

| Acceptance criterion | Decision / Issue section | Implementation | Evidence |
| --- | --- | --- | --- |
|  |  |  |  |

## Files

<!-- List owned directories and any shared files changed. -->

## Contracts

<!-- State whether ToolResult, Source, Location, Verification, registry, or Agent interfaces changed. Link the dedicated Contract Issue when applicable. -->

## Sources

<!-- List official data sources and retrieval/publication dates, or write N/A. -->

## Tests

<!-- List unit tests, representative eval questions, and the full local command results. Confirm no real model or network was used. -->

- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm test:run`
- [ ] `pnpm build`
- [ ] `pnpm lint` after build

## Limitations

<!-- Describe known gaps, failure behavior, and follow-up work. -->

## Unresolved decisions

<!-- List each unresolved decision, owner, blocker/deadline, and whether it is safe to merge. Write None when all are resolved. -->

## Safety and review

- [ ] No secret, token, `.env.local`, private data, raw large dataset, or generated build output is included.
- [ ] Shared-file changes are scoped and coordinated.
- [ ] The Module Decision Record is complete and reflects the delivered behavior.
- [ ] Every acceptance criterion has implementation and evidence, or is explicitly listed as a limitation.
- [ ] At least two representative eval questions were added for a Tool change.
- [ ] Automated tests do not call a real model or network.
