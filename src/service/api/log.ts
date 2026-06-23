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
// 后端真实端点：GET /admin/audit/operations（返回 OperationLogItem 列表）
export class OperationLogAPI {
  /**
   * 获取用户操作日志列表
   */
  static async getList(params: {
    page?: number;
    pageSize?: number;
    page_size?: number;
    keyword?: string;
    userIds?: string;
    usernames?: string;
    operations?: string;
    tables?: string;
    objectId?: string;
    object_id?: string;
    ipAddress?: string;
    ip_address?: string;
    hasDiff?: boolean;
    has_diff?: boolean;
    from?: string;
    to?: string;
    sortBy?: string;
    sort_by?: string;
    sortDir?: string;
    sort_dir?: string;
  }) {
    const q = new URLSearchParams();

    const pageSize = params.pageSize ?? params.page_size;
    if (params.page !== undefined) q.append('page', String(params.page));
    if (pageSize !== undefined) q.append('size', String(pageSize));

    // operations → operation_type（取单个）
    const ops = params.operations;
    if (ops) q.append('operation_type', ops.split(',')[0]);

    // userIds → target_id（查看某个用户被操作的记录）
    const userIds = params.userIds;
    if (userIds) {
      const first = userIds.split(',')[0];
      q.append('target_id', first);
      q.append('target_type', 'user');
    }

    // tables → target_type（取单个）
    if (params.tables) q.append('target_type', params.tables.split(',')[0]);

    // from/to (ISO date) → start_time/end_time (unix)
    if (params.from) q.append('start_time', String(Math.floor(new Date(params.from).getTime() / 1000)));
    if (params.to) q.append('end_time', String(Math.floor(new Date(params.to).getTime() / 1000)));

    const queryString = q.toString();
    const response = await apiRequest<any>(`/admin/audit/operations${queryString ? `?${queryString}` : ''}`);

    if (response.success && response.data) {
      const rawItems: any[] = response.data.items || [];
      const items = rawItems.map((l: any) => ({
        id: l.log_id ?? l.id,
        user_id: l.operator_id,
        username: l.operator_name,
        operation: l.operation_type,
        table_name: l.target_type,
        object_id: l.target_id,
        old_data: l.data_before,
        new_data: l.data_after,
        description: l.reason,
        ip_address: l.operator_ip,
        source: l.trace_id,
        operation_at: l.created_at,
        created_at: l.created_at
      }));
      const pagination = response.data.pagination || {};
      return {
        ...response,
        data: {
          items,
          page: pagination.page || 1,
          page_size: pagination.size || pageSize || 20,
          total: pagination.total ?? 0,
          total_pages: Math.ceil((pagination.total ?? 0) / (pagination.size || pageSize || 20))
        }
      };
    }
    return response;
  }

  /**
   * 导出用户操作日志（后端暂无接口）
   */
  static async export(_params: any) {
    return { code: 404, success: false, message: '后端暂未提供操作日志导出接口' };
  }

  /**
   * 获取操作日志统计（后端暂无接口）
   */
  static async getStats(_params?: { from?: string; to?: string }) {
    return { code: 404, success: false, message: '后端暂未提供操作日志统计接口' };
  }
}
