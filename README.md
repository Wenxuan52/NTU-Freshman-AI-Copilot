# NTU Freshman AI Copilot

NTU Freshman AI Copilot is a source-aware assistant for new NTU students. This local prototype branch provides a safe Mock vertical slice, a basic curated Food / Location flow, and an optional Plan Lite flow:

```text
Chat UI → Next.js API Route → Main ToolLoopAgent → Food / Location Tool
        → deterministic Trust Validator → Answer + Sources + Locations + Map
                                      ↘ Plan Lite Tool → Checklist + Map links
```

It is an engineering scaffold, not yet an authoritative NTU information service. Synthetic Mock content is always labelled `needs_review`.

This is a [public GitHub repository](https://github.com/Wenxuan52/NTU-Freshman-AI-Copilot) released under the [MIT License](LICENSE).

## Five-minute start

Required versions are Node.js 22.13 or newer (CI uses Node.js 22) and pnpm 11.23.0.

```bash
git clone https://github.com/Wenxuan52/NTU-Freshman-AI-Copilot.git
cd NTU-Freshman-AI-Copilot
corepack enable
corepack prepare pnpm@11.23.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`. The page and static Mock preview work without credentials. The Plan Lite profile builder and live Ask requests enter the Main Agent path and therefore need server model configuration.

If your shell does not already use Node.js 22, switch to Node.js `22.13.0` or newer before running the commands above. The repository declares the required Node and pnpm versions in `package.json`.

## Mock mode and real-model mode

The visible Mock preview and deterministic unit tests use synthetic local data and make no network or model call. They are suitable for development and CI. With an empty chat, open `http://localhost:3000` to see the offline vertical-slice demo immediately; this path does not require an API key.

The map preview keeps one detailed location list in the Context Panel. Search by name, category, description, or address to filter both the list and markers. Select a location there or click its marker to focus the same place on the map. Use **Full screen** for a larger map, or **Add location** to add a temporary user-provided point for the current browser session. Manual points are labelled `needs_review` and are not sent back to the Agent.

Live chat uses Groq through the official AI SDK provider package. The example selects `openai/gpt-oss-20b`, which is available on Groq's Free Plan subject to Groq's current rate limits. Copy the template locally and supply a newly created key; never commit this file, paste the key into chat, or share its contents:

```bash
cp .env.example .env.local
```

```dotenv
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-20b
```

Both variables stay server-side. Without either value, a valid Ask request returns a safe `503 SERVER_CONFIGURATION_ERROR`; it is not treated as malformed client input.

Each contributor must create and use their own key rather than sharing the project owner's credentials. Follow the [Groq API Key setup guide](docs/collaboration/groq-api-key.md) for account setup, local configuration, verification, and key rotation.

## Commands

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm test:run
pnpm build
```

Run one test file while iterating:

```bash
pnpm test:run tests/mock-tool.test.ts
```

Before review, use the same order as CI:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test:run
pnpm build
pnpm lint
```

The second lint intentionally verifies that Next.js build-generated declarations remain excluded without weakening source-code lint rules. Tests require no API key and must not contact a model or network.

## Choose a task

1. Review the interest table in the [Team Plan](docs/planning/team-development-plan.md).
2. Choose one of the six core directions in [Module Ownership](docs/collaboration/module-ownership.md). Directions are not permanently bound to names.
3. Create a Module Task Issue and record scope, owner, collaborators, directories, sources, acceptance criteria, tests, and blockers.
4. Follow [CONTRIBUTING.md](CONTRIBUTING.md) and the nearest module `AGENTS.md`.
5. Branch from the latest `main` with `feature/<module-name>`, `fix/<problem-name>`, or `docs/<topic>`.

Roadmap, Plan Lite, and the 3D Map remain voluntary explorations after the core MVP; they are not mandatory member assignments.

## Repository structure

```text
src/app/          Next.js UI, layout, styles, and Chat API
src/agent/        Main ToolLoopAgent and instructions
src/components/   Chat, Context Panel, and source presentation
src/config/       Server environment and model configuration
src/contracts/    Canonical shared Zod contracts
src/tools/        Modular Tool implementations and registry
src/trust/        Deterministic source and location validation
tests/            Offline unit and request-boundary tests
evals/            Representative routing questions
docs/             Decisions, planning, and collaboration guides
```

## Add a Tool

1. Work in the direction's owned `src/tools/<module>/` and `data/curated/<module>/` directories.
2. Define a narrow Zod input schema and explicit failure behavior.
3. Return canonical `ToolResult`, `Source`, `Location`, and `Verification` types from `src/contracts/`; do not redefine them.
4. Pass factual output through `validateToolResult` and use traceable official sources.
5. Add unit and trust-boundary tests plus at least two representative eval questions.
6. After protocol tests pass, coordinate the high-conflict `src/tools/registry.ts` edit with System Integration.
7. Add typed UI rendering only when the Tool introduces a new structured part.

## Submit a PR

Do not develop or push changes directly on `main`. Work on a `feature/*`, `fix/*`, or `docs/*` branch, push only that branch, and open a PR using the repository template. Describe Scope, Files, Contracts, Sources, Tests, and Limitations; link the task Issue. No human approval is required, but the `verify` CI check must pass before merge. The project owner may merge their own PR after CI passes. Never force-push or delete `main`.

Future team members are added individually by the project owner with **Write** permission only, never Admin or Maintain. After joining, each member records their interests before creating a Module Task Issue.

## Current limitations

- The onboarding flow remains synthetic; the Food / Location Tool is currently limited to a small curated dataset and does not perform live retrieval.
- No real NTU retrieval, RAG, authentication, full Roadmap Engine, or 3D Map exists.
- The local Plan Lite prototype uses deterministic templates and non-sensitive profile choices; it is not an official schedule and exact dates must be checked at the linked source.
- The Food / Location Tool now provides a small curated dataset and a Leaflet + OpenStreetMap preview; venue details and opening hours still require manual verification.
- Loading and error behavior exist, but broader cancel and partial-result UX remains an Integration deliverable.
- Live Ask requests use Groq and require a valid local `GROQ_API_KEY`; Free Plan limits and model availability are controlled by Groq.
- Credential distribution, the primary target-user definition, and three final Demo paths remain team decisions.

## Project guides

- [Contributing workflow](CONTRIBUTING.md)
- [Team Plan](docs/planning/team-development-plan.md)
- [Task Development Guide](docs/collaboration/task-development-guide.md)
- [Module Decision Record](docs/collaboration/module-decision-template.md)
- [Module Ownership](docs/collaboration/module-ownership.md)
- [Groq API Key](docs/collaboration/groq-api-key.md)
- [Clean product repository ADR](docs/decisions/0001-clean-product-repository.md)

## Upstream attribution

Architecture and selected interaction patterns were informed by Vercel AI SDK's `examples/next-agent`. The SDK is consumed through published packages; no SDK monorepo source is vendored here. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
