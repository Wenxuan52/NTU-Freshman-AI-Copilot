import { foodLocationTool } from '@/tools/food-location/food-location-tool';
import { mockNtuInfoTool } from '@/tools/mock/mock-ntu-info-tool';

export const toolRegistry = {
  foodLocation: foodLocationTool,
  mockNtuInfo: mockNtuInfoTool,
};
