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

// 401 错误处理标志，防止重复登出
let isHandling401 = false;

/**
 * 处理 401 未授权错误
 * 当 API 返回 401 时，自动清理本地认证状态并跳转到登录页
 */
function handle401Error() {
  // 防止重复处理
  if (isHandling401) {
    return;
  }

  isHandling401 = true;

  // 动态导入 auth store，避免循环依赖
  import('@/stores/auth')
    .then(({ useAuthStore }) => {
      const { logout } = useAuthStore.getState();

      // 清理本地认证状态
      logout();

      // 清理 localStorage 中的持久化数据
      localStorage.removeItem('auth-storage');

      // 显示提示信息
      console.warn('[401 Unauthorized] 登录已过期，正在跳转到登录页...');

      // 跳转到登录页
      if (typeof window !== 'undefined') {
        // 保存当前页面路径，登录后可以跳转回来
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath !== '/login') {
          sessionStorage.setItem('redirectAfterLogin', currentPath);
        }

        // 跳转到登录页
        window.location.href = '/login';
      }

      // 延迟重置标志，确保不会在同一个请求周期内重复处理
      setTimeout(() => {
        isHandling401 = false;
      }, 1000);
    })
    .catch((error) => {
      console.error('[401 Handler] 导入 auth store 失败:', error);
      isHandling401 = false;
    });
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
      // 处理 401 未授权错误 - 自动登出
      if (response.status === 401) {
        handle401Error();
      }

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

    // 检查业务层面的 401 错误（有些后端返回 HTTP 200 但 code 为 401）
    if (result.code === 401) {
      handle401Error();
    }

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
      // 处理数组参数
      if (Array.isArray(value)) {
        value.forEach((item) => {
          searchParams.append(key, String(item));
        });
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
}
