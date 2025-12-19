import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { logger } from '@/lib/logger';

const REMOTE_API_URL =
  'https://api.xreddeercasino.com/api/admin/deposit-orders';

/**
 * 充值订单列表 API - 代理到远程 API
 * GET /api/admin/deposit-orders
 * POST /api/admin/deposit-orders
 */
async function handleRequest(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      await logger.warn(
        '充值订单管理',
        '获取充值订单列表',
        '未授权访问：缺少 token',
        {
          timestamp: new Date().toISOString()
        }
      );
      return unauthorizedResponse('未授权访问');
    }

    // 解析请求参数（支持 GET 和 POST）
    let params: Record<string, any> = {};

    if (request.method === 'POST') {
      try {
        params = await request.json().catch(() => ({}));
      } catch {
        params = {};
      }
    } else {
      const { searchParams } = new URL(request.url);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    // 构建查询参数
    const queryParams = new URLSearchParams();

    // 分页参数
    if (params.page) {
      queryParams.append('page', String(params.page));
    }
    if (params.page_size) {
      queryParams.append('page_size', String(params.page_size));
    }
    if (params.pageSize) {
      queryParams.append('page_size', String(params.pageSize));
    }

    // 其他筛选参数映射
    const filterMappings: Record<string, string> = {
      orderNo: 'order_no',
      order_no: 'order_no',
      channelOrderNo: 'channel_order_no',
      channel_order_no: 'channel_order_no',
      userId: 'user_id',
      user_id: 'user_id',
      userKeyword: 'user_keyword',
      user_keyword: 'user_keyword',
      username: 'username',
      paymentChannelId: 'payment_channel_id',
      payment_channel_id: 'payment_channel_id',
      status: 'status',
      statuses: 'status',
      createdFrom: 'created_from',
      created_from: 'created_from',
      createdTo: 'created_to',
      created_to: 'created_to',
      minAmount: 'min_amount',
      min_amount: 'min_amount',
      maxAmount: 'max_amount',
      max_amount: 'max_amount',
      currency: 'currency',
      ipAddress: 'ip_address',
      ip_address: 'ip_address'
    };

    Object.entries(filterMappings).forEach(([key, backendKey]) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ''
      ) {
        queryParams.append(backendKey, String(params[key]));
      }
    });

    // 处理状态数组
    if (params.statuses) {
      try {
        const statusArray = Array.isArray(params.statuses)
          ? params.statuses
          : JSON.parse(String(params.statuses));
        if (Array.isArray(statusArray) && statusArray.length > 0) {
          // 如果有多个状态，取第一个或组合
          queryParams.append('status', String(statusArray[0]));
        }
      } catch {
        if (params.statuses) {
          queryParams.append('status', String(params.statuses));
        }
      }
    }

    // 构建远程 API URL
    const queryString = queryParams.toString();
    const remoteUrl = queryString
      ? `${REMOTE_API_URL}?${queryString}`
      : REMOTE_API_URL;

    // 记录发送到远程 API 的请求日志
    console.log('[充值订单列表] 发送请求到远程API:', remoteUrl);

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
      const requestDuration = Date.now() - requestStartTime;
      console.error('[充值订单列表] 远程API请求失败:', {
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
    console.log(
      '[充值订单列表] 远程API响应:',
      JSON.stringify(
        {
          code: result.code,
          msg: result.msg,
          dataInfo: {
            total: result.data?.total,
            page: result.data?.page,
            page_size: result.data?.page_size,
            itemsCount: Array.isArray(result.data?.items)
              ? result.data.items.length
              : 0
          }
        },
        null,
        2
      )
    );

    // 转换响应格式以匹配前端期望的结构
    // 远程 API 返回: { code: 200, msg: "SUCCESS", data: { items: [], total, page, page_size, total_pages } }
    // 前端期望: { code: 0, data: { items: [], total, page, page_size, total_pages } }
    // 注意：数据转换在 API 服务层完成，这里只做基本转发
    if ((result.code === 200 || result.code === 0) && result.data) {
      const transformedData = {
        items: result.data.items || [],
        total: result.data.total || 0,
        page: result.data.page || 1,
        page_size: result.data.page_size || 10,
        total_pages: result.data.total_pages || 1
      };

      // 记录返回给前端的响应日志
      const requestDuration = Date.now() - requestStartTime;
      console.log(
        '[充值订单列表] 返回给前端:',
        JSON.stringify(
          {
            code: 0,
            itemsCount: transformedData.items.length,
            total: transformedData.total,
            requestDuration: `${requestDuration}ms`
          },
          null,
          2
        )
      );

      return successResponse(transformedData);
    }

    // 如果远程 API 返回错误
    if (result.code !== 200 && result.code !== 0) {
      console.warn('[充值订单列表] 远程API返回错误:', {
        code: result.code,
        msg: result.msg
      });
      return errorResponse(result.msg || '获取充值订单列表失败');
    }

    // 如果格式不匹配，直接返回原始数据
    return successResponse(result.data || result);
  } catch (error) {
    // 记录错误日志
    const requestDuration = Date.now() - requestStartTime;
    console.error('[充值订单列表] 获取充值订单列表失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });

    return errorResponse('获取充值订单列表失败');
  }
}

// 支持 GET 和 POST 请求
export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
