# Groq API Key

The live Chat window uses Groq through the server-side `@ai-sdk/groq` provider. Each contributor must create and use their own Groq API key. Do not share the project owner's key or another contributor's quota.

## 1. Create your own key

1. Sign in to the [Groq Console](https://console.groq.com/).
2. Create or select a development project. Use a recognizable name such as `ntu-freshman-copilot-dev`.
3. Open the project's API Keys page and create a key.
4. Copy it once into your local `.env.local` as described below. Never paste it into chat, an Issue, a PR, a screenshot, or a shared document.

Groq keys are project-specific. Contributors should keep their projects and usage separate so that one person's experiments do not consume another person's limits.

## 2. Configure the local repository

From the repository root:

```bash
cp .env.example .env.local
```

Open `.env.local` in your editor and set:

```dotenv
GROQ_API_KEY=your-own-key-here
GROQ_MODEL=openai/gpt-oss-20b
```

Do not add quotes or trailing spaces unless they are intentionally part of a value. Restart `pnpm dev` after changing environment variables.

`.env.local` is ignored by Git. The API key is read only by the server-side Chat route and must never be exposed through a `NEXT_PUBLIC_` variable or client component.

## 3. Verify the setup

Run:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`, enter a short question, and select **Ask**.

- A streamed answer means the Groq model path is working.
- `SERVER_CONFIGURATION_ERROR` means one or both variables are missing or the development server was not restarted.
- An authentication error usually means the key is invalid, revoked, or copied incorrectly.
- HTTP 429 means the current Groq project reached a rate limit; wait for the relevant limit to reset and check the project's Limits page.

Automated tests and CI do not use a Groq key and must not call a real model or network.

## 4. Free Plan and model choice

The repository currently documents `openai/gpt-oss-20b` as its low-cost development model. Groq controls model availability and Free Plan limits, which can change. Check the [official rate-limit table](https://console.groq.com/docs/rate-limits) and your project's Limits page before a demo or load test.

Changing the shared default model requires a scoped PR that updates `.env.example`, configuration tests, and documentation together. A contributor may temporarily test another supported model only in their ignored `.env.local`.

## 5. Protect and rotate keys

- Never commit `.env.local` or copy a key into source code.
- Never send keys through group chat, email, Issues, PRs, or screenshots.
- Use a separate key or project for development and deployment.
- Revoke a key immediately in the Groq Console if it is exposed or suspected to be exposed, then create a replacement.
- Before pushing, review `git status` and the staged diff for accidental credentials.

Groq's [security guidance](https://console.groq.com/docs/production-readiness/security-onboarding) recommends environment variables or a secret manager and immediate revocation when compromise is suspected.
