import { apiRequest, buildSearchParams } from './base';

/**
 * 系统参数配置相关 API — 透传 Next.js 代理 → 后端 /admin/system-configs。
 * 配置键由代码定义：只有列表与更新（整值写入 + 版本乐观锁），无新建/删除。
 */
export class SystemConfigAPI {
  /**
   * 获取系统参数配置列表
   * GET /api/admin/system-configs
   */
  static async getList(params?: {
    page?: number;
    page_size?: number;
    keyword?: string;
    config_types?: string[];
    /** 精确键集过滤（业务分类/业务词搜索在前端映射成键集） */
    config_keys?: string[];
    is_public?: boolean;
    disabled?: boolean;
    show_removed?: boolean;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
  }) {
    // 构建查询参数
    const queryParams: Record<string, any> = {};

    if (params?.page) queryParams.page = params.page;
    if (params?.page_size) queryParams.page_size = params.page_size;
    if (params?.keyword) queryParams.keyword = params.keyword;
    if (params?.config_types && params.config_types.length > 0) {
      queryParams.config_types = params.config_types.join(',');
    }
    if (params?.config_keys && params.config_keys.length > 0) {
      queryParams.config_keys = params.config_keys.join(',');
    }
    if (params?.is_public !== undefined) {
      queryParams.is_public = params.is_public;
    }
    if (params?.disabled !== undefined) {
      queryParams.disabled = params.disabled;
    }
    if (params?.show_removed !== undefined) {
      queryParams.show_removed = params.show_removed;
    }
    if (params?.sort_by) queryParams.sort_by = params.sort_by;
    if (params?.sort_dir) queryParams.sort_dir = params.sort_dir;

    const searchParams = buildSearchParams(queryParams);
    return apiRequest(
      `/admin/system-configs${searchParams ? `?${searchParams}` : ''}`
    );
  }

  /**
   * 更新系统参数配置（整值写入 + 版本乐观锁）
   * PUT /api/admin/system-configs/:id
   */
  static async update(
    id: number,
    data: {
      config_value?: string;
      description?: string;
      disabled?: boolean;
      version: number;
      reason?: string;
    }
  ) {
    return apiRequest(`/admin/system-configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
}
