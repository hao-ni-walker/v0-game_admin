import { NextResponse } from 'next/server';

// 统一响应接口
export interface ApiResponse<T = any> {
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

// 成功响应
export function successResponse<T>(
  data: T,
  pager?: ApiResponse['pager']
): NextResponse {
  const response: ApiResponse<T> = {
    code: 0,
    data
  };

  if (pager) {
    response.pager = pager;
  }

  return NextResponse.json(response);
}

// 失败响应
export function errorResponse(
  message: string,
  code: number = -1
): NextResponse {
  const response: ApiResponse = {
    code,
    message
  };

  return NextResponse.json(response, { status: code === -1 ? 200 : 500 });
}

// 404 响应
export function notFoundResponse(message: string = '资源不存在'): NextResponse {
  return NextResponse.json(
    {
      code: -1,
      message
    },
    { status: 404 }
  );
}

// 401 响应
export function unauthorizedResponse(
  message: string = '未授权访问'
): NextResponse {
  return NextResponse.json(
    {
      code: -1,
      message
    },
    { status: 401 }
  );
}

// 403 响应
export function forbiddenResponse(message: string = '权限不足'): NextResponse {
  return NextResponse.json(
    {
      code: -1,
      message
    },
    { status: 403 }
  );
}

// 429 响应
export function tooManyRequestsResponse(
  message: string = '请求过于频繁，请稍后再试'
): NextResponse {
  return NextResponse.json(
    {
      code: -1,
      message
    },
    { status: 429 }
  );
}

// 503 响应（上游服务不可用 / 网关错误 / 超时）
export function serviceUnavailableResponse(
  message: string = '服务暂不可用，请稍后重试'
): NextResponse {
  return NextResponse.json(
    {
      code: -1,
      message
    },
    { status: 503 }
  );
}
