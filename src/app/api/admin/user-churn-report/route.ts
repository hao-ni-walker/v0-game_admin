import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_API_URL =
  'https://api.xreddeercasino.com/api/admin/user-churn-report';

/**
 * 获取用户流失报表 API - 代理到远程 API
 * GET /api/admin/user-churn-report
 */
export async function GET(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[用户流失报表] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);

    // 如果没有提供日期参数，默认使用过去一个月
    let startDate = searchParams.get('start_date');
    let endDate = searchParams.get('end_date');

    if (!startDate || !endDate) {
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);

      // 格式化日期为 YYYY-MM-DD
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      if (!startDate) {
        startDate = formatDate(oneMonthAgo);
      }
      if (!endDate) {
        endDate = formatDate(now);
      }
    }

    // 构建查询参数
    const queryParams = new URLSearchParams();
    queryParams.set('start_date', startDate);
    queryParams.set('end_date', endDate);

    // 保留其他查询参数（如 page, page_size）
    searchParams.forEach((value, key) => {
      if (key !== 'start_date' && key !== 'end_date') {
        queryParams.set(key, value);
      }
    });

    const queryString = queryParams.toString();

    // 构建远程 API URL
    const remoteUrl = `${REMOTE_API_URL}?${queryString}`;

    // 记录请求日志
    console.log('[用户流失报表] 发送请求到远程API:', remoteUrl);

    // 转发请求到远程 API
    const remoteResponse = await fetch(remoteUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token.value}`
      }
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      console.error('[用户流失报表] 远程API请求失败:', {
        status: remoteResponse.status,
        statusText: remoteResponse.statusText,
        errorText
      });

      if (remoteResponse.status === 401) {
        return unauthorizedResponse('认证失败，请重新登录');
      }

      return errorResponse(
        `远程API错误: ${remoteResponse.status} ${remoteResponse.statusText}`
      );
    }

    // 解析远程 API 响应
    const result = await remoteResponse.json();

    // 控制台打印响应
    const requestDuration = Date.now() - requestStartTime;
    console.log(`[用户流失报表] 请求成功，耗时: ${requestDuration}ms`, result);

    // 返回成功响应
    return successResponse(result.data || result);
  } catch (error) {
    console.error('[用户流失报表] 请求异常:', error);
    return errorResponse(
      error instanceof Error ? error.message : '获取用户流失报表失败'
    );
  }
}
