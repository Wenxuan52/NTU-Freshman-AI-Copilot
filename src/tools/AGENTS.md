# Tool Boundary Rules

This file applies under `src/tools/` and supplements the root `AGENTS.md`.

- Each domain Tool owns a narrow input schema, explicit failure behavior, traceable official sources, representative eval questions, and deterministic tests.
- Import the canonical `ToolResult`, `Source`, `Location`, and `Verification` contracts. Never redefine equivalent result shapes inside a Tool.
- Pass factual results through the deterministic trust validator. Missing evidence returns `needs_review` or `unavailable`; model judgment cannot upgrade a result to `verified`.
- Coordinates must come from curated, sourced data. Never ask a model to guess, repair, or normalize them.
- Automated tests use fixtures or injected adapters and never call a real model, NTU website, or network.
- `registry.ts` is a high-conflict shared file. Add a Tool only after its schema, protocol, trust-boundary, and representative-question tests pass, then coordinate the registry edit with System Integration.
- Do not refactor unrelated Tools in a feature PR. Contract changes need a dedicated Issue and updates to all consumers, tests, and docs.
