import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { logger } from '@/lib/logger';

const REMOTE_API_URL = 'https://api.xreddeercasino.com/api/admin/activities';

/**
 * 活动列表 API - 代理到远程 API
 * POST /api/activities/list
 */
export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      await logger.warn('活动管理', '获取活动列表', '未授权访问：缺少 token', {
        timestamp: new Date().toISOString()
      });
      return unauthorizedResponse('未授权访问');
    }

    // 解析请求体
    const body = await request.json().catch(() => ({}));

    // 记录请求日志
    console.log('[活动列表] 收到请求:', JSON.stringify(body, null, 2));

    // 将请求体参数转换为查询参数
    const queryParams = new URLSearchParams();

    // 分页参数
    if (body.page) queryParams.append('page', String(body.page));
    if (body.pageSize) queryParams.append('page_size', String(body.pageSize));
    if (body.page_size) queryParams.append('page_size', String(body.page_size));

    // 搜索参数
    if (body.keyword) queryParams.append('keyword', body.keyword);
    if (body.name) queryParams.append('name', body.name);
    if (body.activity_code) queryParams.append('activity_code', body.activity_code);
    if (body.activityCode) queryParams.append('activity_code', body.activityCode);

    // 活动类型
    if (body.activity_type) queryParams.append('activity_type', body.activity_type);
    if (body.activityType) queryParams.append('activity_type', body.activityType);
    if (body.activityTypes && Array.isArray(body.activityTypes) && body.activityTypes.length > 0) {
      queryParams.append('activity_type', body.activityTypes[0]);
    }

    // 状态
    if (body.status) queryParams.append('status', body.status);
    if (body.statuses && Array.isArray(body.statuses) && body.statuses.length > 0) {
      queryParams.append('status', body.statuses[0]);
    }

    // 时间范围
    if (body.start_from) queryParams.append('start_from', body.start_from);
    if (body.startFrom) queryParams.append('start_from', body.startFrom);
    if (body.start_to) queryParams.append('start_to', body.start_to);
    if (body.startTo) queryParams.append('start_to', body.startTo);
    if (body.end_from) queryParams.append('end_from', body.end_from);
    if (body.endFrom) queryParams.append('end_from', body.endFrom);
    if (body.end_to) queryParams.append('end_to', body.end_to);
    if (body.endTo) queryParams.append('end_to', body.endTo);

    // 排序
    if (body.sort_by) queryParams.append('sort_by', body.sort_by);
    if (body.sortBy) queryParams.append('sort_by', body.sortBy);
    if (body.sort_order) queryParams.append('sort_order', body.sort_order);
    if (body.sortDir) queryParams.append('sort_order', body.sortDir);

    // 默认排序
    if (!queryParams.has('sort_by')) {
      queryParams.append('sort_by', 'id');
      queryParams.append('sort_order', 'desc');
    }

    // 构建远程 API URL
    const queryString = queryParams.toString();
    const remoteUrl = queryString ? `${REMOTE_API_URL}?${queryString}` : REMOTE_API_URL;

    // 记录发送到远程 API 的请求日志
    console.log('[活动列表] 发送请求到远程API:', remoteUrl);

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
      const requestDuration = Date.now() - requestStartTime;
      console.error('[活动列表] 远程API请求失败:', {
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

    // 控制台打印完整响应（调试用）
    console.log('[活动列表] 远程API响应:', JSON.stringify({
      code: result.code,
      msg: result.msg,
      dataInfo: {
        total: result.data?.total,
        page: result.data?.page,
        page_size: result.data?.page_size,
        itemsCount: Array.isArray(result.data?.items) ? result.data.items.length : 0
      }
    }, null, 2));

    // 转换响应格式以匹配前端期望的结构
    // 远程 API 返回: { code: 200, msg: "SUCCESS", data: { items: [], total, page, page_size } }
    // 前端期望: { code: 0, data: { list: [], total, page, page_size } }
    if ((result.code === 200 || result.code === 0) && result.data) {
      const transformedData = {
        list: result.data.items || result.data.list || [],
        total: result.data.total || 0,
        page: result.data.page || 1,
        page_size: result.data.page_size || result.data.pageSize || 20
      };

      // 记录返回给前端的响应日志
      const requestDuration = Date.now() - requestStartTime;
      console.log('[活动列表] 返回给前端:', JSON.stringify({
        code: 0,
        listCount: transformedData.list.length,
        total: transformedData.total,
        requestDuration: `${requestDuration}ms`
      }));

      return successResponse(transformedData);
    }

    // 如果远程 API 返回错误
    if (result.code !== 200 && result.code !== 0) {
      console.warn('[活动列表] 远程API返回错误:', {
        code: result.code,
        msg: result.msg
      });
      return errorResponse(result.msg || '获取活动列表失败');
    }

    // 如果格式不匹配，直接返回原始数据
    return successResponse(result.data || result);
  } catch (error) {
    // 记录错误日志
    const requestDuration = Date.now() - requestStartTime;
    console.error('[活动列表] 获取活动列表失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });

    return errorResponse('获取活动列表失败');
  }
}
