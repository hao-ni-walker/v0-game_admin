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
    // 构建查询参数，使用下划线命名格式（与 curl 命令中的格式一致）
    const queryParams: Record<string, string> = {};

    // 分页参数
    if (params?.page !== undefined) {
      queryParams.page = String(params.page);
    }
    if (params?.page_size !== undefined) {
      queryParams.page_size = String(params.page_size);
    } else if (params?.pageSize !== undefined) {
      queryParams.page_size = String(params.pageSize);
    }

    // 排序参数
    if (params?.sort_by !== undefined) {
      queryParams.sort_by = params.sort_by;
    } else if (params?.sortBy !== undefined) {
      queryParams.sort_by = params.sortBy;
    }
    if (params?.sort_order !== undefined) {
      queryParams.sort_order = params.sort_order;
    } else if (params?.sortDir !== undefined) {
      queryParams.sort_order = params.sortDir;
    }

    // 用户基本信息
    if (params?.id !== undefined) {
      queryParams.id = String(params.id);
    }
    if (params?.id_min !== undefined) {
      queryParams.id_min = String(params.id_min);
    }
    if (params?.id_max !== undefined) {
      queryParams.id_max = String(params.id_max);
    }
    if (params?.username !== undefined && params.username !== '') {
      queryParams.username = params.username;
    }
    if (params?.email !== undefined && params.email !== '') {
      queryParams.email = params.email;
    }
    if (params?.idname !== undefined && params.idname !== '') {
      queryParams.idname = params.idname;
    }
    if (params?.keyword !== undefined && params.keyword !== '') {
      // keyword 可能匹配用户名或邮箱，这里使用 username 参数
      queryParams.username = params.keyword;
    }

    // 账户状态
    if (params?.status !== undefined) {
      if (typeof params.status === 'boolean') {
        queryParams.status = params.status ? 'true' : 'false';
      } else if (typeof params.status === 'string' && params.status !== '') {
        queryParams.status = params.status;
      }
    }
    if (params?.vip_level !== undefined) {
      queryParams.vip_level = String(params.vip_level);
    }
    if (params?.vip_level_min !== undefined) {
      queryParams.vip_level_min = String(params.vip_level_min);
    }
    if (params?.vip_level_max !== undefined) {
      queryParams.vip_level_max = String(params.vip_level_max);
    }
    if (params?.is_locked !== undefined) {
      if (typeof params.is_locked === 'boolean') {
        queryParams.is_locked = params.is_locked ? 'true' : 'false';
      } else if (params.is_locked !== '') {
        queryParams.is_locked = String(params.is_locked);
      }
    }

    // 代理关系
    if (params?.agent !== undefined && params.agent !== '') {
      queryParams.agent = params.agent;
    } else if (
      params?.agents !== undefined &&
      Array.isArray(params.agents) &&
      params.agents.length > 0
    ) {
      queryParams.agent = params.agents[0];
    }
    if (params?.direct_superior_id !== undefined) {
      queryParams.direct_superior_id = String(params.direct_superior_id);
    } else if (
      params?.directSuperiorIds !== undefined &&
      Array.isArray(params.directSuperiorIds) &&
      params.directSuperiorIds.length > 0
    ) {
      queryParams.direct_superior_id = String(params.directSuperiorIds[0]);
    }

    // 注册信息
    if (
      params?.registration_method !== undefined &&
      params.registration_method !== ''
    ) {
      queryParams.registration_method = params.registration_method;
    } else if (
      params?.registrationMethods !== undefined &&
      Array.isArray(params.registrationMethods) &&
      params.registrationMethods.length > 0
    ) {
      queryParams.registration_method = params.registrationMethods[0];
    }
    if (
      params?.registration_source !== undefined &&
      params.registration_source !== ''
    ) {
      queryParams.registration_source = params.registration_source;
    } else if (
      params?.registrationSources !== undefined &&
      Array.isArray(params.registrationSources) &&
      params.registrationSources.length > 0
    ) {
      queryParams.registration_source = params.registrationSources[0];
    }
    if (
      params?.identity_category !== undefined &&
      params.identity_category !== ''
    ) {
      queryParams.identity_category = params.identity_category;
    } else if (
      params?.identityCategories !== undefined &&
      Array.isArray(params.identityCategories) &&
      params.identityCategories.length > 0
    ) {
      queryParams.identity_category = params.identityCategories[0];
    }

    // 钱包信息范围
    if (params?.balance_min !== undefined) {
      queryParams.balance_min = String(params.balance_min);
    } else if (params?.balanceMin !== undefined) {
      queryParams.balance_min = String(params.balanceMin);
    }
    if (params?.balance_max !== undefined) {
      queryParams.balance_max = String(params.balance_max);
    } else if (params?.balanceMax !== undefined) {
      queryParams.balance_max = String(params.balanceMax);
    }
    if (params?.total_deposit_min !== undefined) {
      queryParams.total_deposit_min = String(params.total_deposit_min);
    }
    if (params?.total_deposit_max !== undefined) {
      queryParams.total_deposit_max = String(params.total_deposit_max);
    }
    if (params?.total_withdraw_min !== undefined) {
      queryParams.total_withdraw_min = String(params.total_withdraw_min);
    }
    if (params?.total_withdraw_max !== undefined) {
      queryParams.total_withdraw_max = String(params.total_withdraw_max);
    }

    // 时间范围
    if (
      params?.created_at_start !== undefined &&
      params.created_at_start !== ''
    ) {
      queryParams.created_at_start = params.created_at_start;
    } else if (params?.createdFrom !== undefined && params.createdFrom !== '') {
      queryParams.created_at_start = params.createdFrom;
    }
    if (params?.created_at_end !== undefined && params.created_at_end !== '') {
      queryParams.created_at_end = params.created_at_end;
    } else if (params?.createdTo !== undefined && params.createdTo !== '') {
      queryParams.created_at_end = params.createdTo;
    }
    if (
      params?.last_login_start !== undefined &&
      params.last_login_start !== ''
    ) {
      queryParams.last_login_start = params.last_login_start;
    } else if (
      params?.lastLoginFrom !== undefined &&
      params.lastLoginFrom !== ''
    ) {
      queryParams.last_login_start = params.lastLoginFrom;
    }
    if (params?.last_login_end !== undefined && params.last_login_end !== '') {
      queryParams.last_login_end = params.last_login_end;
    } else if (params?.lastLoginTo !== undefined && params.lastLoginTo !== '') {
      queryParams.last_login_end = params.lastLoginTo;
    }

    // 构建查询字符串
    const searchParams = buildSearchParams(queryParams);
    const endpoint = `/admin/users${searchParams ? `?${searchParams}` : ''}`;

    // 直接调用 GET /api/admin/users 接口
    return apiRequest(endpoint, {
      method: 'GET'
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
  static async updatePlayer(
    id: number,
    data: {
      status?: boolean | string;
      vip_level?: number;
      agent?: string;
      direct_superior_id?: number;
      lock?: {
        action: 'lock' | 'unlock';
        lock_time?: string;
      };
    }
  ) {
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
  static async adjustWallet(
    id: number,
    data: {
      field: 'balance' | 'frozen_balance' | 'bonus';
      type: 'add' | 'subtract';
      amount: number;
      reason: string;
      version: number;
    }
  ) {
    return apiRequest(`/players/${id}/wallet/adjust`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 批量操作
  static async batchOperation(
    playerIds: number[],
    operation: 'enable' | 'disable' | 'export'
  ) {
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
  static async sendNotification(
    id: number,
    data: {
      channel: string;
      title: string;
      content: string;
    }
  ) {
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
