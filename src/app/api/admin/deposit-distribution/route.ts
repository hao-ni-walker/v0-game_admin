import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_API_URL =
  'https://api.xreddeercasino.com/api/admin/deposit-distribution';

/**
 * 获取储值分布 API - 代理到远程 API
 * GET /api/admin/deposit-distribution
 */
export async function GET(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[储值分布] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);

    // 如果没有提供日期参数，设置默认时间为过去一个月
    let startDate = searchParams.get('start_date');
    let endDate = searchParams.get('end_date');

    if (!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);

      // 格式化为 YYYY-MM-DD
      startDate = start.toISOString().split('T')[0];
      endDate = end.toISOString().split('T')[0];

      // 设置默认参数
      searchParams.set('start_date', startDate);
      searchParams.set('end_date', endDate);
    }

    const queryString = searchParams.toString();

    // 构建远程 API URL
    const remoteUrl = queryString
      ? `${REMOTE_API_URL}?${queryString}`
      : REMOTE_API_URL;

    // 记录请求日志
    console.log('[储值分布] 发送请求到远程API:', remoteUrl);

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
      console.error('[储值分布] 远程API请求失败:', {
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
    console.log(`[储值分布] 请求成功，耗时: ${requestDuration}ms`, result);

    // 返回成功响应
    return successResponse(result.data || result);
  } catch (error) {
    console.error('[储值分布] 请求异常:', error);
    return errorResponse(
      error instanceof Error ? error.message : '获取储值分布失败'
    );
  }
}
