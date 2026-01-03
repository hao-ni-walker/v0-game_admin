import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_API_URL = 'https://api.xreddeercasino.com/api/admin/games/sync';

/**
 * 同步平台游戏 API - 代理到远程 API
 * POST /api/admin/games/sync
 */
export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[同步游戏] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }

    // 解析请求体
    const body = await request.json();
    const { provider_code } = body;

    if (!provider_code) {
      return errorResponse('缺少平台代码参数');
    }

    // 记录请求日志
    console.log('[同步游戏] 发送请求到远程API:', {
      provider_code,
      remoteUrl: REMOTE_API_URL
    });

    // 转发请求到远程 API
    const remoteResponse = await fetch(REMOTE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: JSON.stringify({ provider_code })
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      console.error('[同步游戏] 远程API请求失败:', {
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
    console.log('[同步游戏] 远程API响应:', {
      code: result.code,
      message: result.msg || result.message,
      requestDuration: `${requestDuration}ms`
    });

    // 转换响应格式
    if ((result.code === 200 || result.code === 0) && result.data) {
      return NextResponse.json({
        code: 0,
        message: result.msg || result.message || '同步成功',
        success: true,
        data: result.data
      });
    }

    // 如果远程 API 返回错误
    if (result.code !== 200 && result.code !== 0) {
      console.warn('[同步游戏] 远程API返回错误:', {
        code: result.code,
        msg: result.msg || result.message
      });
      return errorResponse(result.msg || result.message || '同步游戏失败');
    }

    return NextResponse.json({
      code: result.code || 0,
      message: result.msg || result.message || '同步成功',
      success: true,
      data: result.data || result
    });
  } catch (error) {
    const requestDuration = Date.now() - requestStartTime;
    console.error('[同步游戏] 同步游戏失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });

    return errorResponse('同步游戏失败');
  }
}
