import { safeValidateUIMessages } from 'ai';
import { z } from 'zod';

import type { MainAgentUIMessage } from '@/agent/main-agent';
import { toolRegistry } from '@/tools/registry';

export const MAX_CHAT_MESSAGES = 50;
export const MAX_MESSAGE_PARTS = 100;
export const MAX_USER_TEXT_LENGTH = 12_000;
export const MAX_REQUEST_CHARACTERS = 128_000;

const MessageEnvelopeSchema = z
  .object({
    id: z.string().trim().min(1).max(128),
    role: z.enum(['user', 'assistant']),
    parts: z.array(z.unknown()).max(MAX_MESSAGE_PARTS),
  })
  .strict();

const DefaultChatTransportRequestSchema = z
  .object({
    id: z.string().trim().min(1).max(128),
    messages: z.array(MessageEnvelopeSchema).min(1).max(MAX_CHAT_MESSAGES),
    trigger: z.enum(['submit-message', 'regenerate-message']),
    messageId: z.string().trim().min(1).max(128).optional(),
  })
  .strict();

export type ParsedChatRequest = {
  id: string;
  messages: MainAgentUIMessage[];
  trigger: 'submit-message' | 'regenerate-message';
  messageId?: string;
};

export type ChatRequestValidation =
  | { success: true; data: ParsedChatRequest }
  | { success: false };

const allowedAssistantPartTypes = new Set([
  'text',
  'reasoning',
  'tool-foodLocation',
  'step-start',
  'tool-mockNtuInfo',
]);

export async function validateChatRequestBody(
  body: unknown,
): Promise<ChatRequestValidation> {
  const envelope = DefaultChatTransportRequestSchema.safeParse(body);

  if (!envelope.success) {
    return { success: false };
  }

  const validatedMessages = await safeValidateUIMessages<MainAgentUIMessage>({
    messages: envelope.data.messages,
    tools: toolRegistry,
  });

  if (!validatedMessages.success) {
    return { success: false };
  }

  let userTextLength = 0;
  const messageIds = new Set<string>();

  for (const message of validatedMessages.data) {
    if (message.role === 'system' || messageIds.has(message.id)) {
      return { success: false };
    }

    messageIds.add(message.id);

    for (const part of message.parts) {
      if (message.role === 'user') {
        if (part.type !== 'text') {
          return { success: false };
        }

        userTextLength += part.text.length;
        continue;
      }

      if (!allowedAssistantPartTypes.has(part.type)) {
        return { success: false };
      }
    }
  }

  if (userTextLength > MAX_USER_TEXT_LENGTH) {
    return { success: false };
  }

  if (
    envelope.data.messageId !== undefined &&
    !messageIds.has(envelope.data.messageId)
  ) {
    return { success: false };
  }

  return {
    success: true,
    data: {
      id: envelope.data.id,
      messages: validatedMessages.data,
      trigger: envelope.data.trigger,
      ...(envelope.data.messageId === undefined
        ? {}
        : { messageId: envelope.data.messageId }),
    },
  };
}
