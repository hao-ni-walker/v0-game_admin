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
   * GET /api/admin/user-operation-logs
   */
  static async getList(params: {
    page?: number;
    pageSize?: number;
    page_size?: number; // 支持 snake_case
    keyword?: string;
    userIds?: string;
    usernames?: string;
    operations?: string;
    tables?: string;
    objectId?: string;
    object_id?: string; // 支持 snake_case
    ipAddress?: string;
    ip_address?: string; // 支持 snake_case
    hasDiff?: boolean;
    has_diff?: boolean; // 支持 snake_case
    from?: string;
    to?: string;
    sortBy?: string;
    sort_by?: string; // 支持 snake_case
    sortDir?: string;
    sort_dir?: string; // 支持 snake_case
  }) {
    // 构建查询参数，优先使用 snake_case 格式以匹配远程 API
    const searchParams = new URLSearchParams();

    if (params.page !== undefined) {
      searchParams.append('page', String(params.page));
    }
    if (params.pageSize !== undefined) {
      searchParams.append('page_size', String(params.pageSize));
    } else if (params.page_size !== undefined) {
      searchParams.append('page_size', String(params.page_size));
    }
    if (params.keyword) {
      searchParams.append('keyword', params.keyword);
    }
    if (params.userIds) {
      searchParams.append('user_ids', params.userIds);
    }
    if (params.usernames) {
      searchParams.append('usernames', params.usernames);
    }
    if (params.operations) {
      searchParams.append('operations', params.operations);
    }
    if (params.tables) {
      searchParams.append('tables', params.tables);
    }
    if (params.objectId) {
      searchParams.append('object_id', params.objectId);
    } else if (params.object_id) {
      searchParams.append('object_id', params.object_id);
    }
    if (params.ipAddress) {
      searchParams.append('ip_address', params.ipAddress);
    } else if (params.ip_address) {
      searchParams.append('ip_address', params.ip_address);
    }
    if (params.hasDiff !== undefined) {
      searchParams.append('has_diff', String(params.hasDiff));
    } else if (params.has_diff !== undefined) {
      searchParams.append('has_diff', String(params.has_diff));
    }
    if (params.from) {
      searchParams.append('from', params.from);
    }
    if (params.to) {
      searchParams.append('to', params.to);
    }
    if (params.sortBy) {
      searchParams.append('sort_by', params.sortBy);
    } else if (params.sort_by) {
      searchParams.append('sort_by', params.sort_by);
    }
    if (params.sortDir) {
      searchParams.append('sort_dir', params.sortDir);
    } else if (params.sort_dir) {
      searchParams.append('sort_dir', params.sort_dir);
    }

    const queryString = searchParams.toString();
    const endpoint = `/admin/user-operation-logs${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint, {
      method: 'GET'
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
