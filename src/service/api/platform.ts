import { apiRequest, buildSearchParams } from './base';

/**
 * 平台相关 API
 */
export class PlatformAPI {
  /**
   * 获取平台列表
   * GET /api/admin/platforms
   */
  static async getList(params?: {
    page?: number;
    page_size?: number;
    keyword?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
  }) {
    // 构建查询参数
    const queryParams: Record<string, any> = {};

    if (params?.page) queryParams.page = params.page;
    if (params?.page_size) queryParams.page_size = params.page_size;
    if (params?.keyword) queryParams.keyword = params.keyword;
    if (params?.sort_by) queryParams.sort_by = params.sort_by;
    if (params?.sort_dir) queryParams.sort_dir = params.sort_dir;

    const searchParams = buildSearchParams(queryParams);
    return apiRequest(
      `/admin/platforms${searchParams ? `?${searchParams}` : ''}`
    );
  }

  /**
   * 获取平台详情
   * GET /api/admin/platforms/:id
   */
  static async getDetail(id: number) {
    return apiRequest(`/admin/platforms/${id}`);
  }
}
