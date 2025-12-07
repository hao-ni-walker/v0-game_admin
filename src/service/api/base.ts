// API 基础 URL
export const API_BASE_URL = '/api';

// 统一的 API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  data?: T;
  message?: string;
  success: boolean;
  pager?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 通用请求函数
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  // 如果是 FormData，不设置 Content-Type，让浏览器自动设置
  const isFormData = options.body instanceof FormData;

  const defaultOptions: RequestInit = {
    headers: isFormData
      ? {}
      : {
          'Content-Type': 'application/json'
        }
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // 尝试解析错误响应
      try {
        const errorData = await response.json();
        return {
          code: errorData.code ?? response.status,
          message:
            errorData.message ?? `HTTP error! status: ${response.status}`,
          success: false
        };
      } catch {
        return {
          code: response.status,
          message: `HTTP error! status: ${response.status}`,
          success: false
        };
      }
    }

    const result = await response.json();

    // 添加调试日志
    console.log('[API Response]', endpoint, result);

    // 统一响应格式，添加 success 字段
    // 后端返回 code: 0 或 code: 200 表示成功
    const isSuccess = result.code === 0 || result.code === 200;

    return {
      ...result,
      success: isSuccess,
      message: result.message || result.msg
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      code: -1,
      message: error instanceof Error ? error.message : 'API request failed',
      success: false
    };
  }
}

// 构建查询参数
export function buildSearchParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}
