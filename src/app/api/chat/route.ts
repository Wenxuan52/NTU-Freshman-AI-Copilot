import { createChatPostHandler } from '@/app/api/chat/handler';

export const runtime = 'nodejs';
export const maxDuration = 30;

export const POST = createChatPostHandler();
