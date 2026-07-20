import { apiRequest } from './base';

// Backend status (normal|frozen|blacklist) ↔ frontend (active|locked|disabled)
function toFrontendStatus(status: string): 'active' | 'locked' | 'disabled' {
  if (status === 'frozen') return 'locked';
  if (status === 'blacklist') return 'disabled';
  return 'active';
}

function toBackendStatus(status: string | boolean): string | undefined {
  if (typeof status === 'boolean') return status ? 'normal' : 'frozen';
  if (status === 'active') return 'normal';
  if (status === 'locked') return 'frozen';
  if (status === 'disabled') return 'blacklist';
  return status || undefined;
}

function tsToIso(ts: number | null | undefined): string | undefined {
  return ts ? new Date(ts * 1000).toISOString() : undefined;
}

function valueToIso(value: unknown): string | undefined {
  if (typeof value === 'number') return tsToIso(value);
  if (typeof value === 'string' && value) return value;
  return undefined;
}

function numericId(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const EMPTY_WALLET = {
  balance: 0,
  frozen_balance: 0,
  bonus: 0,
  credit: 0,
  withdrawable: 0,
  total_deposit: 0,
  total_withdraw: 0,
  total_bet: 0,
  total_win: 0,
  currency: '',
  status: 'active' as const,
  version: 0
};

// 用户相关 API
export class PlayerAPI {
  // 获取用户列表
  static async getPlayers(params?: {
    id?: number;
    username?: string;
    email?: string;
    idname?: string;
    keyword?: string;
    status?: boolean | string;
    vip_level?: number;
    is_locked?: boolean;
    balance_min?: number;
    balance_max?: number;
    balanceMin?: number;
    balanceMax?: number;
    total_deposit_min?: number;
    total_deposit_max?: number;
    total_withdraw_min?: number;
    total_withdraw_max?: number;
    created_at_start?: string;
    created_at_end?: string;
    createdFrom?: string;
    createdTo?: string;
    last_login_start?: string;
    last_login_end?: string;
    lastLoginFrom?: string;
    lastLoginTo?: string;
    page?: number;
    page_size?: number;
    pageSize?: number;
    sort_by?: string;
    sortBy?: string;
    sort_order?: 'asc' | 'desc';
    sortDir?: 'asc' | 'desc';
    [key: string]: any;
  }) {
    const q: Record<string, string> = {};

    if (params?.page !== undefined) q.page = String(params.page);
    const size = params?.page_size ?? params?.pageSize;
    if (size !== undefined) q.size = String(size);

    const sortBy = params?.sort_by ?? params?.sortBy;
    if (sortBy) q.sort_by = sortBy;
    const sortOrder = params?.sort_order ?? params?.sortDir;
    if (sortOrder) q.sort_order = sortOrder;

    const keyword = params?.keyword || params?.username || params?.email || params?.idname;
    if (keyword) q.keyword = keyword;

    if (params?.id !== undefined) q.keyword = q.keyword || String(params.id);

    if (params?.status !== undefined && params.status !== '') {
      const mapped = toBackendStatus(params.status);
      if (mapped) q.status = mapped;
    }

    const bMin = params?.balance_min ?? params?.balanceMin;
    if (bMin !== undefined) q.balance_min = String(bMin);
    const bMax = params?.balance_max ?? params?.balanceMax;
    if (bMax !== undefined) q.balance_max = String(bMax);

    const createdFrom = params?.created_at_start ?? params?.createdFrom;
    if (createdFrom) q.register_start = String(Math.floor(new Date(createdFrom).getTime() / 1000));
    const createdTo = params?.created_at_end ?? params?.createdTo;
    if (createdTo) q.register_end = String(Math.floor(new Date(createdTo).getTime() / 1000));

    const search = new URLSearchParams(q).toString();
    const response = await apiRequest<any>(`/admin/users${search ? `?${search}` : ''}`);

    if (response.success && response.data) {
      const items = (response.data.items || []).map((it: any) => {
        const wallet = it.wallet || {};
        const userId = it.id ?? it.user_id;
        const totalBet = it.total_bet ?? wallet.total_bet ?? 0;
        const totalWin = it.total_win ?? wallet.total_win ?? totalBet + (it.net_pnl ?? 0);

        return {
          id: numericId(userId),
          idname: it.idname || it.display_name || '',
          username: it.username || it.tg_username || it.display_name || '',
          email: '',
          status: toFrontendStatus(it.status),
          vip_level: it.vip_level || 0,
          tags: Array.isArray(it.tags) ? it.tags : [],
          created_at: valueToIso(it.created_at ?? it.registered_at) || '',
          updated_at: valueToIso(it.updated_at),
          last_login: valueToIso(it.last_login ?? it.last_active_at),
          wallet: {
            ...EMPTY_WALLET,
            ...wallet,
            balance: it.balance ?? wallet.balance ?? 0,
            withdrawable:
              it.withdrawable ?? wallet.withdrawable ?? it.balance ?? wallet.balance ?? 0,
            total_deposit: it.total_deposit ?? wallet.total_deposit ?? 0,
            total_withdraw: it.total_withdraw ?? wallet.total_withdraw ?? 0,
            total_bet: totalBet,
            total_win: totalWin
          }
        };
      });
      const pagination = response.data.pagination || {};
      return {
        ...response,
        data: {
          items,
          list: items,
          page: pagination.page || 1,
          page_size: pagination.size || 20,
          total: pagination.total ?? response.data.total ?? 0
        }
      };
    }
    return response;
  }

  // 获取用户统计信息
  static async getStatistics(_params?: Record<string, any>) {
    const response = await apiRequest<any>('/admin/users/statistics');
    if (response.success && response.data) {
      const s = response.data;
      return {
        ...response,
        data: {
          total_players: s.total_players || 0,
          active_players: s.active_players || 0,
          disabled_players: s.disabled_players || 0,
          total_balance: s.total_balance || 0,
          today_new_players: s.today_new_players || 0
        }
      };
    }
    return response;
  }

  // 获取用户详情
  static async getPlayer(id: number) {
    const response = await apiRequest<any>(`/admin/users/${id}`);
    if (response.success && response.data) {
      const d = response.data;
      const stats = d.stats || {};
      const totalBet = stats.total_bet || 0;
      const netPnl = stats.net_pnl || 0;
      return {
        ...response,
        data: {
          id: numericId(d.id ?? d.user_id),
          idname: d.idname || d.display_name || '',
          username: d.username || d.tg_username || d.display_name || '',
          email: '',
          status: toFrontendStatus(d.status),
          vip_level: d.vip_level || 0,
          tags: Array.isArray(d.tags) ? d.tags : [],
          created_at: valueToIso(d.created_at ?? d.registered_at) || '',
          updated_at: valueToIso(d.updated_at),
          last_login: valueToIso(d.last_login ?? d.last_active_at),
          wallet: {
            ...EMPTY_WALLET,
            balance: d.balance || 0,
            frozen_balance: d.frozen_balance || 0,
            withdrawable: d.balance || 0,
            total_deposit: stats.total_deposit || 0,
            total_withdraw: stats.total_withdraw || 0,
            total_bet: totalBet,
            total_win: totalBet + netPnl
          },
          vip_info: {
            level: d.vip_level || 0,
            experience: 0,
            status: 'active' as const,
            created_at: '',
            updated_at: ''
          },
          agency: { subordinate_count: 0 },
          spin_quotas: []
        }
      };
    }
    return response;
  }

  // 更新用户信息（status/lock 路由到 freeze/unfreeze）
  static async updatePlayer(
    id: number,
    data: {
      status?: boolean | string;
      vip_level?: number;
      agent?: string;
      direct_superior_id?: number;
      lock?: { action: 'lock' | 'unlock'; lock_time?: string };
      reason?: string;
    }
  ) {
    const reason = data.reason || '管理员后台操作';
    const wantsLock = data.lock
      ? data.lock.action === 'lock'
      : typeof data.status === 'boolean'
        ? !data.status
        : data.status === 'locked' || data.status === 'disabled';

    if (data.lock || data.status !== undefined) {
      const endpoint = wantsLock ? 'freeze' : 'unfreeze';
      return apiRequest(`/admin/users/${id}/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
    }

    // vip_level / agent 等字段后端暂无对应接口
    return {
      code: 400,
      success: false,
      message: '该字段暂不支持修改（仅支持状态切换）'
    };
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
    const delta = data.type === 'add' ? data.amount : -data.amount;
    const reason = (data.reason && data.reason.length >= 10)
      ? data.reason
      : `${data.reason || '调整'}________`.slice(0, 10);
    return apiRequest(`/admin/users/${id}/balance-adjust`, {
      method: 'POST',
      body: JSON.stringify({ delta, reason })
    });
  }

  // 批量操作
  static async batchOperation(
    playerIds: number[],
    operation: 'enable' | 'disable' | 'export'
  ) {
    return apiRequest('/admin/users/batch', {
      method: 'POST',
      body: JSON.stringify({
        user_ids: playerIds.map(String),
        action: operation === 'enable' ? 'unfreeze' : 'freeze',
        reason: '批量状态操作'
      })
    });
  }

  // 重置密码（后端暂无接口）
  static async resetPassword(_id: number) {
    return { code: 404, success: false, message: '后端暂未提供重置密码接口' };
  }

  // 更新用户状态（路由到 freeze/unfreeze）
  static async updatePlayerStatus(id: number, status: boolean) {
    return PlayerAPI.updatePlayer(id, { status });
  }

  // 更新用户 VIP 等级（后端暂无接口）
  static async updatePlayerVipLevel(_id: number, _vipLevel: number) {
    return { code: 404, success: false, message: '后端暂未提供 VIP 等级修改接口' };
  }

  // 更新用户标签（tags 包含 bot/dev/test 的用户将从所有 admin 报表中排除）
  static async updateTags(id: number, tags: string[], reason?: string) {
    return apiRequest(`/admin/users/${id}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tags, reason: reason || '' })
    });
  }

  // 发送通知（后端暂无接口）
  static async sendNotification(
    id: number,
    data: { channel: string; title: string; content: string }
  ) {
    return apiRequest(`/admin/users/${id}/notify`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 导出用户数据（由前端通过 getPlayers 分页拉取后生成 CSV，此方法保留占位）
  static async exportPlayers(_params?: Record<string, any>) {
    return { code: 404, success: false, message: '请使用前端 CSV 导出' };
  }
}
