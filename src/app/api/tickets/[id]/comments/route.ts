import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

// GET /api/tickets/[id]/comments - 获取评论列表
// POST /api/tickets/[id]/comments - 添加评论
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return errorResponse('无效的工单ID');
    }

    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[工单评论] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }

    // 构建远程 API URL - GET 使用非 admin 路径
    const REMOTE_API_URL = `https://api.xreddeercasino.com/api/tickets/${id}/comments`;

    // 记录请求日志
    console.log('[工单评论] 发送请求到远程API:', REMOTE_API_URL);

    // 转发请求到远程 API
    const remoteResponse = await fetch(REMOTE_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      }
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      console.error('[工单评论] 远程API请求失败:', {
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

    // 转换响应格式
    if ((result.code === 200 || result.code === 0) && result.data) {
      // 转换字段名：snake_case 转为 camelCase
      const transformedItems = (result.data.items || []).map((item: any) => ({
        id: item.id,
        ticketId: item.ticket_id,
        userId: item.author_id, // 注意：远程 API 使用 author_id
        content: item.content,
        isInternal: item.is_internal,
        createdAt: item.created_at
      }));

      console.log('[工单评论] 转换后数据:', {
        ticketId: id,
        itemsCount: transformedItems.length
      });

      return NextResponse.json({
        code: 0,
        message: result.msg || 'SUCCESS',
        success: true,
        data: transformedItems
      });
    }

    // 如果远程 API 返回错误
    if (result.code !== 200 && result.code !== 0) {
      console.warn('[工单评论] 远程API返回错误:', {
        code: result.code,
        msg: result.msg
      });
      return errorResponse(result.msg || '获取评论列表失败');
    }

    return NextResponse.json({
      code: result.code,
      message: result.msg || 'SUCCESS',
      success: true,
      data: result.data?.items || []
    });
  } catch (error) {
    console.error('[工单评论] 获取评论列表失败:', {
      error: error instanceof Error ? error.message : String(error)
    });
    return errorResponse('获取评论列表失败');
  }
}

// POST /api/tickets/[id]/comments - 添加评论
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return errorResponse('无效的工单ID');
    }

    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[工单评论] 未授权访问：缺少 token');
      return unauthorizedResponse('未授权访问');
    }

    // 解析请求体
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return errorResponse('评论内容不能为空');
    }

    // 构建远程 API URL
    const REMOTE_API_URL = `https://api.xreddeercasino.com/api/admin/tickets/${id}/comments`;

    // 记录请求日志
    console.log('[工单评论] 发送POST请求到远程API:', REMOTE_API_URL, {
      content: content.substring(0, 50) + (content.length > 50 ? '...' : '')
    });

    // 转发请求到远程 API
    const remoteResponse = await fetch(REMOTE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: JSON.stringify({ content: content.trim() })
    });

    // 检查 HTTP 状态码
    if (!remoteResponse.ok) {
      const errorText = await remoteResponse.text();
      console.error('[工单评论] 远程API请求失败:', {
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

    console.log('[工单评论] 远程API响应:', {
      code: result.code,
      msg: result.msg
    });

    // 转换响应格式
    if (result.code === 200 || result.code === 0) {
      return NextResponse.json({
        code: 0,
        message: result.msg || 'SUCCESS',
        success: true,
        data: result.data || { id: result.data?.id }
      });
    }

    // 如果远程 API 返回错误
    return errorResponse(result.msg || '添加评论失败');
  } catch (error) {
    console.error('[工单评论] 添加评论失败:', {
      error: error instanceof Error ? error.message : String(error)
    });
    return errorResponse('添加评论失败');
  }
}
