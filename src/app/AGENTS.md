# App Boundary Rules

This file applies under `src/app/` and supplements the root `AGENTS.md`.

- Keep provider configuration and credentials server-only. The Chat route accepts only the real `DefaultChatTransport` envelope fields required by this product and validates UI messages with AI SDK schemas plus explicit product limits.
- Reject client `system` roles and arbitrary instruction fields. Preserve request abort signals, finite agent execution, request-size limits, and safe 4xx/5xx responses that do not leak provider details.
- Render typed message and Tool parts. Never recover sources, locations, or verification state by parsing generated prose.
- System Integration owns wiring, shared message rendering, Context Panel behavior, and loading, error, cancel, and partial-result states. It must not silently change another module's factual Tool content.
- Keep business facts in Tools or curated data, not page components or routes. Keep route parsing and error boundaries unit-testable through small dependencies rather than real provider calls.
- Changes to `globals.css`, Agent interfaces, the registry, or Contracts require the shared-file coordination rules in the root guide.
