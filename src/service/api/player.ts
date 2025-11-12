import { apiRequest } from './base';

// 玩家相关 API
export class PlayerAPI {
  // 获取玩家列表
  static async getPlayers(params: {
    keyword?: string;
    status?: boolean;
    vipLevels?: number[];
    vipMin?: number;
    vipMax?: number;
    balanceMin?: number;
    balanceMax?: number;
    agents?: string[];
    directSuperiorIds?: number[];
    registrationMethods?: string[];
    registrationSources?: string[];
    loginSources?: string[];
    identityCategories?: string[];
    createdFrom?: string;
    createdTo?: string;
    updatedFrom?: string;
    updatedTo?: string;
    lastLoginFrom?: string;
    lastLoginTo?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  }) {
    return apiRequest('/players/list', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // 获取玩家详情
  static async getPlayer(id: number) {
    return apiRequest(`/players/${id}`);
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

  // 更新玩家余额
  static async updatePlayerBalance(id: number, balance: number) {
    return apiRequest(`/players/${id}/balance`, {
      method: 'PUT',
      body: JSON.stringify({ balance })
    });
  }
}
