import { apiRequest, buildSearchParams } from './base';

/**
 * 系统参数配置相关 API
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
   * 获取系统参数配置详情
   * GET /api/admin/system-configs/:id
   */
  static async getDetail(id: number) {
    return apiRequest(`/admin/system-configs/${id}`);
  }

  /**
   * 创建系统参数配置
   * POST /api/admin/system-configs
   */
  static async create(data: {
    config_key: string;
    config_value: string;
    config_type: 'string' | 'number' | 'boolean' | 'json';
    description?: string;
    is_public?: boolean;
    disabled?: boolean;
  }) {
    return apiRequest('/admin/system-configs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * 更新系统参数配置
   * PUT /api/admin/system-configs/:id
   */
  static async update(
    id: number,
    data: {
      config_value?: string;
      description?: string;
      is_public?: boolean;
      disabled?: boolean;
      version: number;
    }
  ) {
    return apiRequest(`/admin/system-configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * 删除系统参数配置
   * DELETE /api/admin/system-configs/:id
   */
  static async delete(id: number) {
    return apiRequest(`/admin/system-configs/${id}`, {
      method: 'DELETE'
    });
  }
}
