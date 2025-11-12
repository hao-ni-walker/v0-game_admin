import { apiRequest, buildSearchParams } from './base';

// 日志相关 API
export class LogAPI {
  // 获取系统日志列表
  static async getLogs(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    level?: string;
  }) {
    const searchParams = buildSearchParams(params || {});
    return apiRequest(`/logs${searchParams ? `?${searchParams}` : ''}`);
  }
}

// 用户操作日志（审计日志）API
export class OperationLogAPI {
  /**
   * 获取用户操作日志列表
   * POST /api/user-operation-logs/list
   */
  static async getList(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    userIds?: string;
    usernames?: string;
    operations?: string;
    tables?: string;
    objectId?: string;
    ipAddress?: string;
    hasDiff?: boolean;
    from?: string;
    to?: string;
    sortBy?: string;
    sortDir?: string;
  }) {
    return apiRequest('/user-operation-logs/list', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  /**
   * 导出用户操作日志
   * POST /api/user-operation-logs/export
   */
  static async export(params: any) {
    return apiRequest('/user-operation-logs/export', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  /**
   * 获取操作日志详情
   * GET /api/user-operation-logs/:id
   */
  static async getDetail(id: number) {
    return apiRequest(`/user-operation-logs/${id}`);
  }

  /**
   * 获取操作日志统计
   * GET /api/user-operation-logs/stats
   */
  static async getStats(params?: { from?: string; to?: string }) {
    const searchParams = buildSearchParams(params || {});
    return apiRequest(
      `/user-operation-logs/stats${searchParams ? `?${searchParams}` : ''}`
    );
  }
}
