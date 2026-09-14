import { foodLocationTool } from '@/tools/food-location/food-location-tool';
import { mockNtuInfoTool } from '@/tools/mock/mock-ntu-info-tool';
import { planLiteTool } from '@/tools/plan-lite/plan-lite-tool';

export const toolRegistry = {
  foodLocation: foodLocationTool,
  mockNtuInfo: mockNtuInfoTool,
  planLite: planLiteTool,
};
