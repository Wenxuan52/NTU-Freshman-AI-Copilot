import { describe, expect, it } from 'vitest';

import { ToolResultSchema } from '@/contracts/tool-result';
import {
  executeMockNtuInfo,
  MockNtuInfoInputSchema,
} from '@/tools/mock/mock-ntu-info-tool';

describe('Mock NTU Info Tool', () => {
  it('validates its query input', () => {
    expect(MockNtuInfoInputSchema.safeParse({ query: '' }).success).toBe(false);
  });

  it('returns a contract-valid, explicitly unverified result without network access', async () => {
    const result = await executeMockNtuInfo({
      query: 'What should I do before orientation?',
    });

    expect(ToolResultSchema.safeParse(result).success).toBe(true);
    expect(result.verification.status).toBe('needs_review');
    expect(result.locations).toEqual([]);
    expect(result.content).toMatch(/Synthetic mock response/);
  });
});
