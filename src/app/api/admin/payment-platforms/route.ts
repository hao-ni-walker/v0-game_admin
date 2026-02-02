import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_API_URL =
  process.env.REMOTE_API_URL || 'https://api.xreddeercasino.com';

/**
 * 获取支付平台列表 API - 代理到远程 API
 * GET /api/admin/payment-platforms
 */
export async function GET(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[支付平台管理] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // 构建远程 API URL
    const remoteUrl = queryString
      ? `${REMOTE_API_URL}/api/admin/payment-platforms?${queryString}`
      : `${REMOTE_API_URL}/api/admin/payment-platforms`;

    // 记录请求日志
    console.log('[支付平台列表] 发送请求到远程API:', remoteUrl);

    // 转发请求到远程 API
    const remoteResponse = await fetch(remoteUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      }
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      console.error('[支付平台列表] 远程API请求失败:', {
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
    console.log(
      '[支付平台列表] 远程API响应:',
      JSON.stringify(
        {
          code: result.code,
          msg: result.msg,
          dataInfo: {
            total: result.data?.total,
            page: result.data?.page,
            page_size: result.data?.page_size,
            total_pages: result.data?.total_pages,
            itemsCount: Array.isArray(result.data?.items)
              ? result.data.items.length
              : 0
          },
          requestDuration: `${requestDuration}ms`
        },
        null,
        2
      )
    );

    // 转换响应格式
    if ((result.code === 200 || result.code === 0) && result.data) {
      // 返回数据，保持原始结构
      return NextResponse.json({
        code: 0,
        message: result.msg || 'SUCCESS',
        success: true,
        data: {
          items: result.data.items || [],
          total: result.data.total || 0,
          page: result.data.page || 1,
          page_size: result.data.page_size || 10,
          total_pages: result.data.total_pages || 1
        }
      });
    }

    // 如果远程 API 返回错误
    if (result.code !== 200 && result.code !== 0) {
      console.warn('[支付平台列表] 远程API返回错误:', {
        code: result.code,
        msg: result.msg
      });
      return errorResponse(result.msg || '获取支付平台列表失败');
    }

    return NextResponse.json({
      code: result.code,
      message: result.msg || 'SUCCESS',
      success: true,
      data: result.data || result
    });
  } catch (error) {
    const requestDuration = Date.now() - requestStartTime;
    console.error('[支付平台列表] 获取支付平台列表失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });

    return errorResponse('获取支付平台列表失败');
  }
}

/**
 * 创建支付平台 API
 * POST /api/admin/payment-platforms
 */
export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[支付平台管理] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }

    // 获取请求体
    const body = await request.json();

    // 构建远程 API URL
    const remoteUrl = `${REMOTE_API_URL}/api/admin/payment-platforms`;

    // 记录请求日志
    console.log('[创建支付平台] 发送请求到远程API:', remoteUrl);

    // 转发请求到远程 API
    const remoteResponse = await fetch(remoteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: JSON.stringify(body)
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      console.error('[创建支付平台] 远程API请求失败:', {
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

    const requestDuration = Date.now() - requestStartTime;
    console.log('[创建支付平台] 远程API响应:', {
      code: result.code,
      msg: result.msg,
      requestDuration: `${requestDuration}ms`
    });

    if (result.code === 200 || result.code === 0) {
      return NextResponse.json({
        code: 0,
        message: result.msg || '创建成功',
        success: true,
        data: result.data
      });
    }

    return errorResponse(result.msg || '创建支付平台失败');
  } catch (error) {
    const requestDuration = Date.now() - requestStartTime;
    console.error('[创建支付平台] 创建支付平台失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });

    return errorResponse('创建支付平台失败');
  }
}
