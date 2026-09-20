import { describe, expect, it } from 'vitest';

import { MAIN_AGENT_INSTRUCTIONS } from '@/agent/instructions';

describe('Main Agent terminology instructions', () => {
  it('uses the reviewed N2FC expansion without inventing another organisation', () => {
    expect(MAIN_AGENT_INSTRUCTIONS).toContain(
      'N2FC means Nanyang NanoFabrication Centre',
    );
    expect(MAIN_AGENT_INSTRUCTIONS).toContain('https://www.ntu.edu.sg/n2fc');
    expect(MAIN_AGENT_INSTRUCTIONS).toContain(
      'Never expand N2FC as a different organisation',
    );
  });
});
