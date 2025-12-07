import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { logger } from '@/lib/logger';

const REMOTE_API_URL = 'https://api.xreddeercasino.com/api/items/';

/**
 * GET /api/items
 * 获取礼包列表 - 代理到远程 API
 */
export async function GET(request: NextRequest) {
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      await logger.warn('礼包管理', '获取礼包列表', '未授权访问：缺少 token', {
        timestamp: new Date().toISOString()
      });
      return unauthorizedResponse('未授权访问');
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // 构建远程 API URL
    const remoteUrl = queryString
      ? `${REMOTE_API_URL}?${queryString}`
      : REMOTE_API_URL;

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
      await logger.error('礼包管理', '获取礼包列表', '远程API请求失败', {
        status: remoteResponse.status,
        statusText: remoteResponse.statusText,
        errorText,
        timestamp: new Date().toISOString()
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

    // 记录成功日志
    await logger.info('礼包管理', '获取礼包列表', '获取礼包列表成功', {
      queryParams: queryString,
      timestamp: new Date().toISOString()
    });

    // 转换响应格式以匹配前端期望的格式
    // 远程API返回: { code: 200, msg: "SUCCESS", data: { total, limit, offset, items: [...] } }
    // 前端期望: { code: 0, data: { total, page, page_size, list: [...] } }
    if (result.code === 200 && result.data) {
      const { total, limit, offset, items } = result.data;
      const pageSize = limit || 20;
      const page = pageSize > 0 ? Math.floor(offset / pageSize) + 1 : 1;

      return successResponse(
        {
          total: total || 0,
          page,
          page_size: pageSize,
          list: items || []
        },
        {
          page,
          limit: pageSize,
          total: total || 0,
          totalPages: pageSize > 0 ? Math.ceil((total || 0) / pageSize) : 0
        }
      );
    }

    // 如果格式不匹配，直接返回原始数据
    return successResponse(result.data || result);
  } catch (error) {
    // 记录错误日志
    await logger.error('礼包管理', '获取礼包列表', '获取礼包列表失败', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return errorResponse('获取礼包列表失败');
  }
}

/**
 * POST /api/items
 * 创建新道具
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 这里应该是数据库操作
    // 现在只是模拟返回
    console.log('创建道具:', body);

    return NextResponse.json(
      {
        message: '道具创建成功',
        data: {
          id: Math.floor(Math.random() * 10000),
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建道具失败:', error);
    return NextResponse.json({ error: '创建道具失败' }, { status: 500 });
  }
}
