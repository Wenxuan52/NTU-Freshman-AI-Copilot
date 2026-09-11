# ADR 0001: Start from a clean product repository

- Status: Accepted
- Date: 2026-09-11

## Context

The available reference checkout is the complete Vercel AI SDK monorepo. The
product needs only a small Next.js application and the published AI SDK APIs.
Keeping the monorepo would mix product ownership with upstream SDK build,
release, provider, and continuous-integration concerns.

## Decision

Build NTU Freshman AI Copilot as an independent, standalone repository. Consume
Vercel AI SDK as versioned package dependencies. Use one configured Main
`ToolLoopAgent` with modular domain Tools and a deterministic trust-validation
gate for every factual Tool result.

## Alternatives considered

- Continue developing inside the SDK fork.
- Copy `packages/ai` and provider implementations into the product.
- Create one autonomous agent per information domain.

## Consequences

- The repository stays small and product-focused.
- SDK upgrades are explicit dependency changes instead of source merges.
- Shared Tool contracts and the central registry become important coordination
  points.
- A single finite Tool loop keeps MVP behavior and cost bounded.
- Upstream examples require attribution when their patterns are adapted.
