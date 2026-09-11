import { DefaultChatTransport } from 'ai';
import { describe, expect, it, vi } from 'vitest';

import type { MainAgentUIMessage } from '@/agent/main-agent';
import {
  createChatPostHandler,
  type ChatRouteDependencies,
} from '@/app/api/chat/handler';
import {
  MAX_CHAT_MESSAGES,
  MAX_MESSAGE_PARTS,
  MAX_USER_TEXT_LENGTH,
} from '@/app/api/chat/request';
import { readServerEnv } from '@/config/env';

const validMessage = {
  id: 'message-1',
  role: 'user',
  parts: [{ type: 'text', text: 'Where can a freshman get help?' }],
} satisfies MainAgentUIMessage;

function jsonRequest(body: unknown, signal?: AbortSignal) {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    signal,
  });
}

async function createDefaultTransportBody(messages: MainAgentUIMessage[]) {
  let capturedBody: unknown;
  const transport = new DefaultChatTransport<MainAgentUIMessage>({
    api: 'http://localhost/api/chat',
    fetch: async (_input, init) => {
      if (typeof init?.body === 'string') {
        capturedBody = JSON.parse(init.body);
      }

      return new Response('', {
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
      });
    },
  });

  await transport.sendMessages({
    trigger: 'submit-message',
    chatId: 'chat-1',
    messageId: undefined,
    messages,
    abortSignal: undefined,
  });

  return capturedBody;
}

function createMockDependencies(): ChatRouteDependencies {
  return {
    assertServerConfiguration: vi.fn(),
    createStreamResponse: vi.fn(async () => new Response('stream-ok')),
  };
}

describe('POST /api/chat request boundary', () => {
  it('accepts the real DefaultChatTransport envelope and preserves the abort signal', async () => {
    const body = await createDefaultTransportBody([validMessage]);
    const dependencies = createMockDependencies();
    const post = createChatPostHandler(dependencies);
    const controller = new AbortController();

    expect(body).toEqual({
      id: 'chat-1',
      messages: [validMessage],
      trigger: 'submit-message',
    });

    const response = await post(jsonRequest(body, controller.signal));

    expect(response.status).toBe(200);
    expect(response.status).not.toBe(400);
    expect(dependencies.assertServerConfiguration).toHaveBeenCalledOnce();
    expect(dependencies.createStreamResponse).toHaveBeenCalledWith({
      messages: [validMessage],
      abortSignal: expect.any(AbortSignal),
    });
    const streamArguments = vi.mocked(dependencies.createStreamResponse).mock
      .calls[0]?.[0];
    expect(streamArguments?.abortSignal.aborted).toBe(false);
    controller.abort();
    expect(streamArguments?.abortSignal.aborted).toBe(true);
  });

  it('rejects a client-provided system role', async () => {
    const post = createChatPostHandler(createMockDependencies());
    const response = await post(
      jsonRequest({
        id: 'chat-1',
        messages: [{ ...validMessage, role: 'system' }],
        trigger: 'submit-message',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'INVALID_REQUEST' },
    });
  });

  it('rejects an invalid trigger', async () => {
    const post = createChatPostHandler(createMockDependencies());
    const response = await post(
      jsonRequest({
        id: 'chat-1',
        messages: [validMessage],
        trigger: 'run-arbitrary-instructions',
      }),
    );

    expect(response.status).toBe(400);
  });

  it('rejects a messageId that is not present in the submitted conversation', async () => {
    const post = createChatPostHandler(createMockDependencies());
    const response = await post(
      jsonRequest({
        id: 'chat-1',
        messages: [validMessage],
        trigger: 'regenerate-message',
        messageId: 'missing-message',
      }),
    );

    expect(response.status).toBe(400);
  });

  it('rejects too many messages', async () => {
    const post = createChatPostHandler(createMockDependencies());
    const messages = Array.from({ length: MAX_CHAT_MESSAGES + 1 }, (_, index) => ({
      ...validMessage,
      id: `message-${index}`,
    }));
    const response = await post(
      jsonRequest({ id: 'chat-1', messages, trigger: 'submit-message' }),
    );

    expect(response.status).toBe(400);
  });

  it('rejects too many parts in one message', async () => {
    const post = createChatPostHandler(createMockDependencies());
    const response = await post(
      jsonRequest({
        id: 'chat-1',
        messages: [
          {
            ...validMessage,
            parts: Array.from({ length: MAX_MESSAGE_PARTS + 1 }, () => ({
              type: 'text',
              text: 'x',
            })),
          },
        ],
        trigger: 'submit-message',
      }),
    );

    expect(response.status).toBe(400);
  });

  it('rejects excessive total user text', async () => {
    const post = createChatPostHandler(createMockDependencies());
    const response = await post(
      jsonRequest({
        id: 'chat-1',
        messages: [
          {
            ...validMessage,
            parts: [{ type: 'text', text: 'x'.repeat(MAX_USER_TEXT_LENGTH + 1) }],
          },
        ],
        trigger: 'submit-message',
      }),
    );

    expect(response.status).toBe(400);
  });

  it('rejects requests that are not JSON before creating the provider', async () => {
    const dependencies = createMockDependencies();
    const post = createChatPostHandler(dependencies);
    const response = await post(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: 'plain text',
        headers: { 'content-type': 'text/plain' },
      }),
    );

    expect(response.status).toBe(415);
    expect(dependencies.assertServerConfiguration).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'The request must use application/json.',
      },
    });
  });

  it('rejects malformed JSON with a safe 400 response', async () => {
    const post = createChatPostHandler(createMockDependencies());
    const response = await post(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: '{not-json',
        headers: { 'content-type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'INVALID_REQUEST',
        message: 'The chat request is invalid.',
      },
    });
  });

  it('returns a safe 503 after validation when server model configuration is missing', async () => {
    const createStreamResponse = vi.fn(async () => new Response('unexpected'));
    const post = createChatPostHandler({
      assertServerConfiguration: () => readServerEnv({}),
      createStreamResponse,
    });
    const body = await createDefaultTransportBody([validMessage]);
    const response = await post(jsonRequest(body));

    expect(response.status).toBe(503);
    expect(createStreamResponse).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'SERVER_CONFIGURATION_ERROR',
        message: 'The chat service is not configured.',
      },
    });
  });

  it('contains unexpected stream failures behind a safe error boundary', async () => {
    const post = createChatPostHandler({
      assertServerConfiguration: () => undefined,
      createStreamResponse: async () => {
        throw new Error('provider secret should not escape');
      },
    });
    const body = await createDefaultTransportBody([validMessage]);
    const response = await post(jsonRequest(body));

    expect(response.status).toBe(500);
    const responseText = await response.text();
    expect(responseText).not.toContain('provider secret');
    expect(JSON.parse(responseText)).toEqual({
      error: {
        code: 'CHAT_REQUEST_FAILED',
        message: 'Unable to start the chat.',
      },
    });
  });
});
