import { describe, expect, it } from 'vitest';

import { createConfiguredModel } from '@/config/ai';
import {
  readServerEnv,
  ServerConfigurationError,
} from '@/config/env';

const configuredEnvironment = {
  GROQ_API_KEY: 'test-only-key',
  GROQ_MODEL: 'openai/gpt-oss-20b',
};

describe('server AI configuration', () => {
  it('validates and trims the Groq configuration', () => {
    expect(
      readServerEnv({
        GROQ_API_KEY: '  test-only-key  ',
        GROQ_MODEL: '  openai/gpt-oss-20b  ',
      }),
    ).toEqual(configuredEnvironment);
  });

  it('creates the configured Groq model without making a network request', () => {
    const model = createConfiguredModel(configuredEnvironment);

    expect(model.provider).toBe('groq.chat');
    expect(model.modelId).toBe('openai/gpt-oss-20b');
  });

  it('rejects missing or blank Groq configuration safely', () => {
    expect(() => readServerEnv({})).toThrow(ServerConfigurationError);
    expect(() =>
      readServerEnv({ GROQ_API_KEY: ' ', GROQ_MODEL: ' ' }),
    ).toThrow('Required server-side AI configuration is missing.');
  });
});
