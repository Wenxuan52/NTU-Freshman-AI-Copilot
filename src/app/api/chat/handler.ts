import { createAgentUIStreamResponse } from 'ai';

import {
  createMainAgent,
  type MainAgentUIMessage,
} from '@/agent/main-agent';
import {
  MAX_REQUEST_CHARACTERS,
  validateChatRequestBody,
} from '@/app/api/chat/request';
import {
  readServerEnv,
  ServerConfigurationError,
} from '@/config/env';

function safeError(code: string, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status });
}

type StreamResponseOptions = {
  messages: MainAgentUIMessage[];
  abortSignal: AbortSignal;
};

export type ChatRouteDependencies = {
  assertServerConfiguration: () => void;
  createStreamResponse: (
    options: StreamResponseOptions,
  ) => Response | Promise<Response>;
};

const defaultDependencies: ChatRouteDependencies = {
  assertServerConfiguration: () => {
    readServerEnv();
  },
  createStreamResponse: ({ messages, abortSignal }) =>
    createAgentUIStreamResponse({
      agent: createMainAgent(),
      uiMessages: messages,
      abortSignal,
    }),
};

export function createChatPostHandler(
  dependencies: ChatRouteDependencies = defaultDependencies,
) {
  return async function post(request: Request): Promise<Response> {
    if (!request.headers.get('content-type')?.includes('application/json')) {
      return safeError(
        'UNSUPPORTED_MEDIA_TYPE',
        'The request must use application/json.',
        415,
      );
    }

    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (contentLength > MAX_REQUEST_CHARACTERS) {
      return safeError('REQUEST_TOO_LARGE', 'The chat request is too large.', 413);
    }

    let body: unknown;

    try {
      const rawBody = await request.text();
      if (rawBody.length > MAX_REQUEST_CHARACTERS) {
        return safeError('REQUEST_TOO_LARGE', 'The chat request is too large.', 413);
      }
      body = JSON.parse(rawBody);
    } catch {
      return safeError('INVALID_REQUEST', 'The chat request is invalid.', 400);
    }

    const validation = await validateChatRequestBody(body);
    if (!validation.success) {
      return safeError('INVALID_REQUEST', 'The chat request is invalid.', 400);
    }

    try {
      dependencies.assertServerConfiguration();
      return await dependencies.createStreamResponse({
        messages: validation.data.messages,
        abortSignal: request.signal,
      });
    } catch (error) {
      if (error instanceof ServerConfigurationError) {
        return safeError(
          'SERVER_CONFIGURATION_ERROR',
          'The chat service is not configured.',
          503,
        );
      }

      return safeError('CHAT_REQUEST_FAILED', 'Unable to start the chat.', 500);
    }
  };
}
