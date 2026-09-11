import { z } from 'zod';

const ServerEnvSchema = z.object({
  OPENAI_API_KEY: z.string().trim().min(1, 'OPENAI_API_KEY is required.'),
  OPENAI_MODEL: z.string().trim().min(1, 'OPENAI_MODEL is required.'),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export class ServerConfigurationError extends Error {
  constructor() {
    super('Required server-side AI configuration is missing.');
    this.name = 'ServerConfigurationError';
  }
}

export function readServerEnv(
  environment: Record<string, string | undefined> = process.env,
): ServerEnv {
  const parsed = ServerEnvSchema.safeParse(environment);

  if (!parsed.success) {
    throw new ServerConfigurationError();
  }

  return parsed.data;
}
