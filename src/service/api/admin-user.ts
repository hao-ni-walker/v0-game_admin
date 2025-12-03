import { apiRequest, buildSearchParams } from './base';

// 管理员用户管理相关 API
export class AdminUserAPI {
  /**
   * 获取用户列表
   * GET /api/admin/users
   */
  static async getUsers(params?: {
    // 用户基本信息
    id?: number;
    id_min?: number;
    id_max?: number;
    username?: string;
    email?: string;
    idname?: string;
    // 账户状态
    status?: string;
    vip_level?: number;
    vip_level_min?: number;
    vip_level_max?: number;
    is_locked?: boolean;
    // 代理关系
    agent?: string;
    direct_superior_id?: number;
    // 注册信息
    registration_method?: string;
    registration_source?: string;
    identity_category?: string;
    // 钱包信息范围
    balance_min?: number;
    balance_max?: number;
    total_deposit_min?: number;
    total_deposit_max?: number;
    total_withdraw_min?: number;
    total_withdraw_max?: number;
    // 时间范围
    created_at_start?: string;
    created_at_end?: string;
    last_login_start?: string;
    last_login_end?: string;
    // 分页和排序
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const searchParams = buildSearchParams(params || {});
    return apiRequest(`/admin/users${searchParams ? `?${searchParams}` : ''}`);
  }

  /**
   * 获取用户统计信息
   * GET /api/admin/users/statistics
   */
  static async getStatistics(params?: {
    // 使用与 getUsers 相同的筛选参数（不包括分页和排序）
    id?: number;
    id_min?: number;
    id_max?: number;
    username?: string;
    email?: string;
    idname?: string;
    status?: string;
    vip_level?: number;
    vip_level_min?: number;
    vip_level_max?: number;
    is_locked?: boolean;
    agent?: string;
    direct_superior_id?: number;
    registration_method?: string;
    registration_source?: string;
    identity_category?: string;
    balance_min?: number;
    balance_max?: number;
    total_deposit_min?: number;
    total_deposit_max?: number;
    total_withdraw_min?: number;
    total_withdraw_max?: number;
    created_at_start?: string;
    created_at_end?: string;
    last_login_start?: string;
    last_login_end?: string;
  }) {
    const searchParams = buildSearchParams(params || {});
    return apiRequest(
      `/admin/users/statistics${searchParams ? `?${searchParams}` : ''}`
    );
  }

  /**
   * 获取用户详情
   * GET /api/admin/users/{user_id}
   */
  static async getUser(userId: number) {
    return apiRequest(`/admin/users/${userId}`);
  }

  /**
   * 更新用户信息
   * PATCH /api/admin/users/{user_id}
   */
  static async updateUser(
    userId: number,
    data: {
      status?: string;
      vip_level?: number;
      agent?: string;
      direct_superior_id?: number;
      lock?: {
        action: 'lock' | 'unlock';
        lock_time?: string;
      };
    }
  ) {
    return apiRequest(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * 调整钱包余额
   * POST /api/admin/users/{user_id}/wallet/adjust
   */
  static async adjustWallet(
    userId: number,
    data: {
      field: 'balance' | 'frozen_balance' | 'bonus';
      type: 'add' | 'subtract';
      amount: number;
      reason: string;
      version: number;
    }
  ) {
    return apiRequest(`/admin/users/${userId}/wallet/adjust`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * 批量操作
   * POST /api/admin/users/batch
   */
  static async batchOperation(
    userIds: number[],
    operation: 'enable' | 'disable' | 'export'
  ) {
    return apiRequest('/admin/users/batch', {
      method: 'POST',
      body: JSON.stringify({
        user_ids: userIds,
        operation
      })
    });
  }

  /**
   * 重置密码
   * POST /api/admin/users/{user_id}/reset_password
   */
  static async resetPassword(userId: number) {
    return apiRequest(`/admin/users/${userId}/reset_password`, {
      method: 'POST'
    });
  }

  /**
   * 发送通知
   * POST /api/admin/users/{user_id}/notify
   */
  static async sendNotification(
    userId: number,
    data: {
      channel: string;
      title: string;
      content: string;
    }
  ) {
    return apiRequest(`/admin/users/${userId}/notify`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * 导出用户数据
   * GET /api/admin/users/export
   */
  static async exportUsers(params?: {
    // 使用与 getUsers 相同的筛选参数
    id?: number;
    id_min?: number;
    id_max?: number;
    username?: string;
    email?: string;
    idname?: string;
    status?: string;
    vip_level?: number;
    vip_level_min?: number;
    vip_level_max?: number;
    is_locked?: boolean;
    agent?: string;
    direct_superior_id?: number;
    registration_method?: string;
    registration_source?: string;
    identity_category?: string;
    balance_min?: number;
    balance_max?: number;
    total_deposit_min?: number;
    total_deposit_max?: number;
    total_withdraw_min?: number;
    total_withdraw_max?: number;
    created_at_start?: string;
    created_at_end?: string;
    last_login_start?: string;
    last_login_end?: string;
  }) {
    const searchParams = buildSearchParams(params || {});
    return apiRequest(
      `/admin/users/export${searchParams ? `?${searchParams}` : ''}`
    );
  }
}

