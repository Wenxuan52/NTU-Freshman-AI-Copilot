import { createOpenAI } from '@ai-sdk/openai';

import { readServerEnv } from '@/config/env';

export function createConfiguredModel() {
  const env = readServerEnv();
  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });

  return openai(env.OPENAI_MODEL);
}
