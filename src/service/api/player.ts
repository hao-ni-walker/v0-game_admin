import { apiRequest, buildSearchParams } from './base';

// 玩家相关 API
export class PlayerAPI {
  // 获取玩家列表
  static async getPlayers(params?: {
    // 用户基本信息
    id?: number;
    id_min?: number;
    id_max?: number;
    username?: string;
    email?: string;
    idname?: string;
    keyword?: string;
    // 账户状态
    status?: boolean | string;
    vip_level?: number;
    vip_level_min?: number;
    vip_level_max?: number;
    vipMin?: number;
    vipMax?: number;
    is_locked?: boolean;
    // 代理关系
    agent?: string;
    agents?: string[];
    direct_superior_id?: number;
    directSuperiorIds?: number[];
    // 注册信息
    registration_method?: string;
    registrationMethods?: string[];
    registration_source?: string;
    registrationSources?: string[];
    identity_category?: string;
    identityCategories?: string[];
    // 钱包信息范围
    balance_min?: number;
    balanceMax?: number;
    balance_max?: number;
    balanceMin?: number;
    total_deposit_min?: number;
    total_deposit_max?: number;
    total_withdraw_min?: number;
    total_withdraw_max?: number;
    // 时间范围
    created_at_start?: string;
    created_at_end?: string;
    createdFrom?: string;
    createdTo?: string;
    last_login_start?: string;
    last_login_end?: string;
    lastLoginFrom?: string;
    lastLoginTo?: string;
    // 分页和排序
    page?: number;
    page_size?: number;
    pageSize?: number;
    sort_by?: string;
    sortBy?: string;
    sort_order?: 'asc' | 'desc';
    sortDir?: 'asc' | 'desc';
  }) {
    // 兼容新旧参数格式
    const requestParams: any = {
      ...params
    };
    
    // 参数映射
    if (params?.vip_level_min !== undefined) requestParams.vipMin = params.vip_level_min;
    if (params?.vip_level_max !== undefined) requestParams.vipMax = params.vip_level_max;
    if (params?.balance_min !== undefined) requestParams.balanceMin = params.balance_min;
    if (params?.balance_max !== undefined) requestParams.balanceMax = params.balance_max;
    if (params?.created_at_start !== undefined) requestParams.createdFrom = params.created_at_start;
    if (params?.created_at_end !== undefined) requestParams.createdTo = params.created_at_end;
    if (params?.last_login_start !== undefined) requestParams.lastLoginFrom = params.last_login_start;
    if (params?.last_login_end !== undefined) requestParams.lastLoginTo = params.last_login_end;
    if (params?.page_size !== undefined) requestParams.pageSize = params.page_size;
    if (params?.sort_by !== undefined) requestParams.sortBy = params.sort_by;
    if (params?.sort_order !== undefined) requestParams.sortDir = params.sort_order;
    if (params?.direct_superior_id !== undefined) requestParams.directSuperiorIds = [params.direct_superior_id];
    if (params?.registration_method !== undefined) requestParams.registrationMethods = [params.registration_method];
    if (params?.identity_category !== undefined) requestParams.identityCategories = [params.identity_category];
    if (params?.agent !== undefined) requestParams.agents = [params.agent];
    
    // 处理 status
    if (params?.status !== undefined) {
      if (typeof params.status === 'string') {
        requestParams.status = params.status === 'active' ? true : params.status === 'disabled' ? false : undefined;
      } else {
        requestParams.status = params.status;
      }
    }

    return apiRequest('/players/list', {
      method: 'POST',
      body: JSON.stringify(requestParams)
    });
  }

  // 获取玩家统计信息
  static async getStatistics(params?: {
    id?: number;
    id_min?: number;
    id_max?: number;
    username?: string;
    email?: string;
    idname?: string;
    status?: boolean | string;
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
    created_at_start?: string;
    created_at_end?: string;
    last_login_start?: string;
    last_login_end?: string;
  }) {
    return apiRequest('/players/statistics', {
      method: 'POST',
      body: JSON.stringify(params || {})
    });
  }

  // 获取玩家详情
  static async getPlayer(id: number) {
    return apiRequest(`/players/${id}`);
  }

  // 更新玩家信息
  static async updatePlayer(id: number, data: {
    status?: boolean | string;
    vip_level?: number;
    agent?: string;
    direct_superior_id?: number;
    lock?: {
      action: 'lock' | 'unlock';
      lock_time?: string;
    };
  }) {
    const requestData: any = { ...data };
    if (typeof data.status === 'string') {
      requestData.status = data.status === 'active' ? true : false;
    }
    return apiRequest(`/players/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(requestData)
    });
  }

  // 更新玩家状态
  static async updatePlayerStatus(id: number, status: boolean) {
    return apiRequest(`/players/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // 更新玩家VIP等级
  static async updatePlayerVipLevel(id: number, vipLevel: number) {
    return apiRequest(`/players/${id}/vip-level`, {
      method: 'PUT',
      body: JSON.stringify({ vipLevel })
    });
  }

  // 调整钱包余额
  static async adjustWallet(id: number, data: {
    field: 'balance' | 'frozen_balance' | 'bonus';
    type: 'add' | 'subtract';
    amount: number;
    reason: string;
    version: number;
  }) {
    return apiRequest(`/players/${id}/wallet/adjust`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 批量操作
  static async batchOperation(playerIds: number[], operation: 'enable' | 'disable' | 'export') {
    return apiRequest('/players/batch', {
      method: 'POST',
      body: JSON.stringify({
        player_ids: playerIds,
        operation
      })
    });
  }

  // 重置密码
  static async resetPassword(id: number) {
    return apiRequest(`/players/${id}/reset_password`, {
      method: 'POST'
    });
  }

  // 发送通知
  static async sendNotification(id: number, data: {
    channel: string;
    title: string;
    content: string;
  }) {
    return apiRequest(`/players/${id}/notify`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 导出玩家数据
  static async exportPlayers(params?: {
    id?: number;
    id_min?: number;
    id_max?: number;
    username?: string;
    email?: string;
    idname?: string;
    status?: boolean | string;
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
    created_at_start?: string;
    created_at_end?: string;
    last_login_start?: string;
    last_login_end?: string;
  }) {
    return apiRequest('/players/export', {
      method: 'POST',
      body: JSON.stringify(params || {})
    });
  }
}
