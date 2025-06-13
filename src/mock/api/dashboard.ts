import {
  mockDashboardStats,
  generateUserGrowthData,
  generateSystemMetrics,
  generatePopularPages,
  type MockDashboardStats
} from '../data/dashboard';
import { successResponse, errorResponse, delay } from '../base';

export class MockDashboardAPI {
  // 获取仪表板概览数据
  async getOverview() {
    await delay();

    try {
      return successResponse(mockDashboardStats);
    } catch (error) {
      return errorResponse('获取仪表板数据失败');
    }
  }
}
