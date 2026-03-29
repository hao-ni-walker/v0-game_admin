import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_API_URL = 'https://api.xreddeercasino.com/api/admin/banners';

/**
 * 获取轮播图列表 API - 代理到远程 API
 * GET /api/admin/banners
 */
export async function GET(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[轮播图管理] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // 构建远程 API URL
    const remoteUrl = queryString
      ? `${REMOTE_API_URL}?${queryString}`
      : REMOTE_API_URL;

    // 记录请求日志
    console.log('[轮播图管理] 发送请求到远程API:', remoteUrl);

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
      console.error('[轮播图管理] 远程API请求失败:', {
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
      '[轮播图管理] 远程API响应:',
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
      // 直接返回，保持与远程 API 一致的格式
      // 注意：前端可能期望 code 为 0
      return NextResponse.json({
        code: 0,
        message: result.msg || 'SUCCESS',
        success: true,
        data: result.data
      });
    }

    // 如果远程 API 返回错误
    if (result.code !== 200 && result.code !== 0) {
      console.warn('[轮播图管理] 远程API返回错误:', {
        code: result.code,
        msg: result.msg
      });
      return errorResponse(result.msg || '获取轮播图列表失败');
    }

    return NextResponse.json({
      code: result.code,
      message: result.msg || 'SUCCESS',
      success: true,
      data: result.data || result
    });
  } catch (error) {
    const requestDuration = Date.now() - requestStartTime;
    console.error('[轮播图管理] 获取轮播图列表失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });

    return errorResponse('获取轮播图列表失败');
  }
}
