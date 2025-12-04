// API 基础 URL
export const API_BASE_URL = '/api';

// 通用请求函数
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
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
