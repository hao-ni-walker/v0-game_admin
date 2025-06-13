// 检测是否为静态部署环境
export const isStaticDeployment =
  (typeof window !== 'undefined' &&
    window.location.hostname.includes('github.io')) ||
  process.env.STATIC_EXPORT === 'true';

// API 基础 URL
export const API_BASE_URL = '/api';

// 通用请求函数
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  if (isStaticDeployment) {
    // 在静态部署环境下，直接返回 Mock 数据
    throw new Error('Static deployment should use Mock API directly');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const result = await response.json();

  // 检查业务状态码
  if (result.code !== 0) {
    throw new Error(result.message || 'API request failed');
  }

  return result;
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
