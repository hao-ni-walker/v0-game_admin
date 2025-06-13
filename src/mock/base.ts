// 统一响应格式接口
export interface MockResponse<T = any> {
  code: number;
  data?: T;
  message?: string;
  pager?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 分页响应接口
export interface PaginatedResponse<T> {
  code: number;
  data: T[];
  pager: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 分页参数接口
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  roleId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// 模拟 API 延迟
export const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// 成功响应工具函数
export function successResponse<T>(
  data: T,
  pager?: MockResponse['pager']
): MockResponse<T> {
  const response: MockResponse<T> = {
    code: 0,
    data
  };

  if (pager) {
    response.pager = pager;
  }

  return response;
}

// 错误响应工具函数
export function errorResponse(message: string): MockResponse {
  return {
    code: -1,
    message
  };
}

// 过滤和分页工具函数
export function filterAndPaginate<T extends Record<string, any>>(
  data: T[],
  params: PaginationParams,
  searchFields: (keyof T)[]
): PaginatedResponse<T> {
  let filtered = [...data];

  // 搜索过滤
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filtered = filtered.filter((item) =>
      searchFields.some((field) =>
        String(item[field]).toLowerCase().includes(searchTerm)
      )
    );
  }

  // 角色过滤
  if (params.role) {
    filtered = filtered.filter((item) => item.role === params.role);
  }

  if (params.roleId) {
    filtered = filtered.filter((item) => String(item.roleId) === params.roleId);
  }

  // 状态过滤
  if (params.status) {
    filtered = filtered.filter((item) => item.status === params.status);
  }

  // 日期范围过滤
  if (params.startDate || params.endDate) {
    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.createdAt);
      const start = params.startDate ? new Date(params.startDate) : null;
      const end = params.endDate ? new Date(params.endDate) : null;

      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      return true;
    });
  }

  // 分页
  const page = params.page || 1;
  const limit = params.limit || 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    code: 0,
    data: filtered.slice(startIndex, endIndex),
    pager: {
      page,
      limit,
      total,
      totalPages
    }
  };
}
