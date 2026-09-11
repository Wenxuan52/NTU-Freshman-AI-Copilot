import { createGroq } from '@ai-sdk/groq';

import { readServerEnv } from '@/config/env';

export function createConfiguredModel(
  environment: Record<string, string | undefined> = process.env,
) {
  const env = readServerEnv(environment);
  const groq = createGroq({ apiKey: env.GROQ_API_KEY });

  return groq(env.GROQ_MODEL);
}
