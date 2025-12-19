import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';
import { logger } from '@/lib/logger';

const REMOTE_API_URL =
  'https://api.xreddeercasino.com/api/admin/withdraw-orders';

/**
 * 提现订单列表 API - 代理到远程 API
 * GET /api/admin/withdraw-orders
 * POST /api/admin/withdraw-orders
 */
async function handleRequest(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      await logger.warn(
        '提现订单管理',
        '获取提现订单列表',
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

    // 其他筛选参数
    const filterMappings: Record<string, string> = {
      orderNo: 'order_no',
      order_no: 'order_no',
      channelOrderNo: 'channel_order_no',
      channel_order_no: 'channel_order_no',
      userId: 'user_id',
      user_id: 'user_id',
      userKeyword: 'username',
      username: 'username',
      paymentChannelId: 'payment_channel_id',
      payment_channel_id: 'payment_channel_id',
      status: 'status',
      createdFrom: 'created_from',
      created_from: 'created_from',
      createdTo: 'created_to',
      created_to: 'created_to',
      minAmount: 'min_amount',
      min_amount: 'min_amount',
      maxAmount: 'max_amount',
      max_amount: 'max_amount'
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
    console.log('[提现订单列表] 发送请求到远程API:', remoteUrl);

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
      console.error('[提现订单列表] 远程API请求失败:', {
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
      '[提现订单列表] 远程API响应:',
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
    // 前端期望: { code: 0, data: { data: [], stats: {}, pager: { page, limit, total, totalPages } } }
    if ((result.code === 200 || result.code === 0) && result.data) {
      // 转换订单数据：snake_case -> camelCase，并映射状态
      const transformedItems = (result.data.items || []).map((item: any) => {
        // 状态映射：根据 status 和 status_text 判断
        let status: string = 'pending_audit';
        const statusNum = item.status;
        const statusText = item.status_text;

        if (statusNum === 1 || statusText === '待审核') {
          status = 'pending_audit';
        } else if (statusNum === 2 || statusText === '审核通过待出款') {
          status = 'audit_passed';
        } else if (statusNum === 3 || statusText === '出款中') {
          status = 'payout_processing';
        } else if (statusNum === 4 || statusText === '成功') {
          status = 'success';
        } else if (statusNum === 5 || statusText === '拒绝') {
          status = 'rejected';
        } else if (statusNum === 6 || statusText === '失败') {
          status = 'failed';
        }

        return {
          id: item.id,
          orderNo: item.order_no,
          channelOrderNo: item.channel_order_no || null,
          userId: item.user_id,
          username: item.username || undefined,
          nickname: item.nickname || undefined,
          phone: item.phone || undefined,
          email: item.email || undefined,
          paymentChannelId: item.payment_channel_id || 0,
          paymentChannelName: item.channel_name || undefined,
          paymentChannelCode: item.channel_code || undefined,
          channelType: item.channel_type || undefined,
          amount: parseFloat(item.amount) || 0,
          fee: parseFloat(item.fee) || 0,
          actualAmount: item.actual_amount
            ? parseFloat(item.actual_amount)
            : null,
          status: status as any,
          currency: item.currency || 'CNY',
          accountName: item.account_name || undefined,
          accountNumber: item.bank_account_no_masked || undefined,
          bankName: item.bank_name || undefined,
          auditStatus: item.audit_status || undefined,
          auditorId: item.auditor_id || null,
          auditorName: item.audit_by_name || null,
          auditAt: item.audit_at || null,
          auditRemark: item.reject_reason || null,
          payoutStatus: item.payout_status || undefined,
          payoutMethod: item.payout_method || undefined,
          payoutAt: item.payout_at || null,
          payoutFailureReason: item.payout_failure_reason || null,
          ipAddress: item.ip_address || null,
          remark: item.remark || null,
          createdAt: item.created_at,
          completedAt: item.completed_at || null,
          updatedAt: item.updated_at || item.created_at
        };
      });

      // 构建分页信息
      const pager = {
        page: result.data.page || 1,
        limit: result.data.page_size || 10,
        total: result.data.total || 0,
        totalPages: result.data.total_pages || 1
      };

      // 构建统计信息（如果没有，使用默认值）
      const stats = {
        totalAmount: 0,
        totalFee: 0,
        totalActualAmount: 0,
        successCount: 0,
        failedCount: 0
      };

      const transformedData = {
        data: transformedItems,
        stats: stats,
        pager: pager
      };

      // 记录返回给前端的响应日志
      const requestDuration = Date.now() - requestStartTime;
      console.log(
        '[提现订单列表] 返回给前端:',
        JSON.stringify(
          {
            code: 0,
            itemsCount: transformedItems.length,
            total: pager.total,
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
      console.warn('[提现订单列表] 远程API返回错误:', {
        code: result.code,
        msg: result.msg
      });
      return errorResponse(result.msg || '获取提现订单列表失败');
    }

    // 如果格式不匹配，直接返回原始数据
    return successResponse(result.data || result);
  } catch (error) {
    // 记录错误日志
    const requestDuration = Date.now() - requestStartTime;
    console.error('[提现订单列表] 获取提现订单列表失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });

    return errorResponse('获取提现订单列表失败');
  }
}

// 支持 GET 和 POST 请求
export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
