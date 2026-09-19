import { describe, expect, it } from 'vitest';

import { MAIN_AGENT_INSTRUCTIONS } from '@/agent/instructions';

describe('Main Agent trust instructions', () => {
  it('limits citations to Tool-returned sources', () => {
    expect(MAIN_AGENT_INSTRUCTIONS).toContain(
      'cite or link only source URLs present in that Tool result',
    );
  });

  it('does not present unavailable or conflicting evidence as a factual answer', () => {
    expect(MAIN_AGENT_INSTRUCTIONS).toContain(
      'when verification is unavailable, do not repeat a factual claim',
    );
    expect(MAIN_AGENT_INSTRUCTIONS).toContain(
      'when verification is stale or conflict',
    );
  });
});
