import { mockLogAPI } from '@/mock';
import { isStaticDeployment, apiRequest, buildSearchParams } from './base';

// 日志相关 API
export class LogAPI {
  // 获取日志列表
  static async getLogs(params: any = {}) {
    if (isStaticDeployment) {
      return mockLogAPI.getLogs(params);
    }

    const queryString = buildSearchParams(params);
    return apiRequest(`/logs?${queryString}`);
  }
}
