import { ToolLoopAgent, isStepCount, type InferAgentUIMessage } from 'ai';

import { MAIN_AGENT_INSTRUCTIONS } from '@/agent/instructions';
import { createConfiguredModel } from '@/config/ai';
import { toolRegistry } from '@/tools/registry';

export function createMainAgent() {
  return new ToolLoopAgent({
    model: createConfiguredModel(),
    instructions: MAIN_AGENT_INSTRUCTIONS,
    tools: toolRegistry,
    stopWhen: isStepCount(5),
  });
}

export type MainAgent = ReturnType<typeof createMainAgent>;
export type MainAgentUIMessage = InferAgentUIMessage<MainAgent>;
