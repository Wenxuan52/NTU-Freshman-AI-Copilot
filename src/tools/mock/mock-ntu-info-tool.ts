import { tool } from 'ai';
import { z } from 'zod';

import { ToolResultSchema, type ToolResult } from '@/contracts/tool-result';
import { validateToolResult } from '@/trust/validator';

export const MockNtuInfoInputSchema = z.object({
  query: z.string().trim().min(2).max(300),
});

export async function executeMockNtuInfo(input: unknown): Promise<ToolResult> {
  const { query } = MockNtuInfoInputSchema.parse(input);
  const now = new Date().toISOString();
  const candidate: ToolResult = {
    content: `Synthetic mock response for “${query}”. This demonstrates the Tool contract only and is not verified NTU policy. Check the linked official NTU website before acting.`,
    sources: [
      {
        id: 'ntu-homepage',
        title: 'NTU Singapore official website (illustrative source)',
        url: 'https://www.ntu.edu.sg/',
        publisher: 'Nanyang Technological University',
        published_at: null,
        retrieved_at: now,
        official: true,
      },
    ],
    locations: [],
    verification: {
      status: 'needs_review',
      checks: ['source_present', 'url_valid', 'official_domain_checked'],
      warnings: [
        'Synthetic MVP content has not been manually verified as NTU policy.',
      ],
      reviewed_at: now,
    },
  };

  const validation = validateToolResult(candidate);

  if (!validation.accepted) {
    throw new Error('Mock Tool output failed deterministic trust validation.');
  }

  return validation.result;
}

export const mockNtuInfoTool = tool({
  description:
    'Return a clearly labelled synthetic NTU information result for MVP flow testing. Use for any NTU freshman question while real retrieval Tools are not implemented.',
  inputSchema: MockNtuInfoInputSchema,
  outputSchema: ToolResultSchema,
  execute: executeMockNtuInfo,
});
