import { apiRequest, buildSearchParams } from './base';

// 玩家相关 API（简化版 - 只读）
export class PlayerAPI {
  // 获取玩家列表
  static async getPlayers(params?: {
    // 搜索
    keyword?: string;
    username?: string;
    telegram_id?: string;
    // 分页
    page?: number;
    page_size?: number;
    // 排序
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const queryParams: Record<string, string> = {};

    // 分页参数
    if (params?.page !== undefined) {
      queryParams.page = String(params.page);
    }
    if (params?.page_size !== undefined) {
      queryParams.page_size = String(params.page_size);
    }

    // 排序参数
    if (params?.sort_by !== undefined) {
      queryParams.sort_by = params.sort_by;
    }
    if (params?.sort_order !== undefined) {
      queryParams.sort_order = params.sort_order;
    }

    // 搜索参数
    if (params?.keyword !== undefined && params.keyword !== '') {
      queryParams.keyword = params.keyword;
    }
    if (params?.username !== undefined && params.username !== '') {
      queryParams.username = params.username;
    }
    if (params?.telegram_id !== undefined && params.telegram_id !== '') {
      queryParams.telegram_id = params.telegram_id;
    }

    // 构建查询字符串
    const searchParams = buildSearchParams(queryParams);
    const endpoint = `/admin/users${searchParams ? `?${searchParams}` : ''}`;

    return apiRequest(endpoint, {
      method: 'GET'
    });
  }
}
