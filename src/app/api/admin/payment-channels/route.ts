import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse
} from '@/service/response';

const REMOTE_API_URL =
  'https://api.xreddeercasino.com/api/admin/payment-channels';

/**
 * 获取支付渠道列表 API - 代理到远程 API
 * GET /api/admin/payment-channels
 */
export async function GET(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[支付渠道管理] 未授权访问：缺少 token');
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
    console.log('[支付渠道列表] 发送请求到远程API:', remoteUrl);

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
      console.error('[支付渠道列表] 远程API请求失败:', {
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
      '[支付渠道列表] 远程API响应:',
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
      // 映射远程 API 的 channel_type 到前端期望的类型
      const mapChannelType = (
        channelType: string
      ): 'alipay' | 'wechat' | 'bank' | 'usdt' | 'other' => {
        const typeMap: Record<
          string,
          'alipay' | 'wechat' | 'bank' | 'usdt' | 'other'
        > = {
          crypto: 'usdt',
          bank: 'bank',
          alipay: 'alipay',
          wechat: 'wechat'
        };
        return typeMap[channelType] || 'other';
      };

      // 转换支付渠道数据：snake_case -> camelCase，并处理数据类型
      const transformedItems = (result.data.items || []).map((item: any) => {
        // 安全的数字解析函数
        const parseNumber = (
          value: string | number | null | undefined
        ): number => {
          if (value === null || value === undefined) return 0;
          if (typeof value === 'number') return isNaN(value) ? 0 : value;
          if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
          }
          return 0;
        };

        return {
          id: item.id,
          name: item.name || '',
          code: item.code || '',
          type: item.type,
          channelType: mapChannelType(item.channel_type || 'other'),
          config: item.config || {},
          minAmount: parseNumber(item.min_amount),
          maxAmount: parseNumber(item.max_amount),
          dailyLimit:
            item.daily_limit !== null && item.daily_limit !== undefined
              ? parseNumber(item.daily_limit)
              : 0,
          feeRate: parseNumber(item.fee_rate),
          fixedFee: parseNumber(item.fixed_fee),
          sortOrder: item.sort_order || 0,
          status: item.status,
          version: item.version || 0,
          createdAt: item.created_at || '',
          updatedAt: item.updated_at || item.created_at || '',
          removed: item.removed || false,
          disabled: item.disabled || false
        };
      });

      // 返回转换后的数据，使用 list 字段以匹配前端期望
      return NextResponse.json({
        code: 0,
        message: result.msg || 'SUCCESS',
        success: true,
        data: {
          list: transformedItems,
          total: result.data.total || 0,
          page: result.data.page || 1,
          page_size: result.data.page_size || 10,
          total_pages: result.data.total_pages || 1
        }
      });
    }

    // 如果远程 API 返回错误
    if (result.code !== 200 && result.code !== 0) {
      console.warn('[支付渠道列表] 远程API返回错误:', {
        code: result.code,
        msg: result.msg
      });
      return errorResponse(result.msg || '获取支付渠道列表失败');
    }

    return NextResponse.json({
      code: result.code,
      message: result.msg || 'SUCCESS',
      success: true,
      data: result.data || result
    });
  } catch (error) {
    const requestDuration = Date.now() - requestStartTime;
    console.error('[支付渠道列表] 获取支付渠道列表失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });

    return errorResponse('获取支付渠道列表失败');
  }
}
