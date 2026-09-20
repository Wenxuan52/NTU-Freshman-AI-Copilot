import { describe, expect, it } from 'vitest';

import { MAIN_AGENT_INSTRUCTIONS } from '@/agent/instructions';

describe('Main Agent trust instructions', () => {
  it('uses the reviewed N2FC expansion without inventing another organisation', () => {
    expect(MAIN_AGENT_INSTRUCTIONS).toContain(
      'N2FC means Nanyang NanoFabrication Centre',
    );
    expect(MAIN_AGENT_INSTRUCTIONS).toContain('https://www.ntu.edu.sg/n2fc');
    expect(MAIN_AGENT_INSTRUCTIONS).toContain(
      'Never expand N2FC as a different organisation',
    );
  });

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
