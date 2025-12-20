import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const REMOTE_API_URL =
  'https://api.xreddeercasino.com/api/admin/payment-channels';

/**
 * POST /api/payment-channels/list
 * 获取支付渠道列表(带筛选和分页) - 代理到远程 API
 */
export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    // 从 cookie 中获取 token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      console.warn('[支付渠道列表] 未授权访问：缺少 token');
      return NextResponse.json(
        { code: 401, message: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      page = 1,
      page_size = 20,
      keyword,
      types,
      channel_types,
      status,
      disabled,
      show_removed,
      min_amount_maxlte,
      max_amount_mingte,
      fee_rate_min,
      fee_rate_max,
      fixed_fee_min,
      fixed_fee_max,
      daily_limit_min,
      daily_limit_max,
      created_from,
      created_to,
      updated_from,
      updated_to,
      sort_by,
      sort_dir
    } = body;

    // 构建查询参数
    const searchParams = new URLSearchParams();
    searchParams.append('page', String(page));
    searchParams.append('page_size', String(page_size));

    // 添加筛选条件到查询参数（如果远程 API 支持）
    // 注意：这里只添加基本的分页参数，其他筛选条件可能需要后端支持
    // 如果远程 API 不支持这些筛选，可以先获取所有数据，然后在前端筛选
    if (keyword) searchParams.append('keyword', keyword);
    if (types && types.length > 0) {
      types.forEach((type: number) =>
        searchParams.append('types', String(type))
      );
    }
    if (status !== undefined && status !== 'all') {
      searchParams.append('status', String(status));
    }

    // 构建远程 API URL
    const remoteUrl = `${REMOTE_API_URL}?${searchParams.toString()}`;

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
        return NextResponse.json(
          { code: 401, message: '认证失败，请重新登录' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { code: 500, message: `远程API错误: ${remoteResponse.status}` },
        { status: 500 }
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

      // 转换支付渠道数据：snake_case -> camelCase，并处理数据类型
      let transformedItems = (result.data.items || []).map((item: any) => {
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

      // 如果远程 API 不支持某些筛选，在这里进行客户端筛选
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        transformedItems = transformedItems.filter(
          (channel) =>
            channel.name?.toLowerCase().includes(lowerKeyword) ||
            channel.code?.toLowerCase().includes(lowerKeyword)
        );
      }

      if (types && types.length > 0) {
        transformedItems = transformedItems.filter((channel) =>
          types.includes(channel.type)
        );
      }

      if (channel_types && channel_types.length > 0) {
        transformedItems = transformedItems.filter((channel) =>
          channel_types.includes(channel.channelType)
        );
      }

      if (status !== undefined && status !== 'all') {
        transformedItems = transformedItems.filter(
          (channel) => channel.status === status
        );
      }

      if (disabled !== undefined) {
        transformedItems = transformedItems.filter(
          (channel) => channel.disabled === disabled
        );
      }

      if (!show_removed) {
        transformedItems = transformedItems.filter(
          (channel) => !channel.removed
        );
      }

      // 应用其他筛选条件...
      if (min_amount_maxlte !== undefined) {
        transformedItems = transformedItems.filter(
          (channel) => channel.minAmount <= min_amount_maxlte
        );
      }
      if (max_amount_mingte !== undefined) {
        transformedItems = transformedItems.filter(
          (channel) => channel.maxAmount >= max_amount_mingte
        );
      }
      if (fee_rate_min !== undefined) {
        transformedItems = transformedItems.filter(
          (channel) => channel.feeRate >= fee_rate_min
        );
      }
      if (fee_rate_max !== undefined) {
        transformedItems = transformedItems.filter(
          (channel) => channel.feeRate <= fee_rate_max
        );
      }
      if (fixed_fee_min !== undefined) {
        transformedItems = transformedItems.filter(
          (channel) => channel.fixedFee >= fixed_fee_min
        );
      }
      if (fixed_fee_max !== undefined) {
        transformedItems = transformedItems.filter(
          (channel) => channel.fixedFee <= fixed_fee_max
        );
      }
      if (daily_limit_min !== undefined) {
        transformedItems = transformedItems.filter(
          (channel) => channel.dailyLimit >= daily_limit_min
        );
      }
      if (daily_limit_max !== undefined) {
        transformedItems = transformedItems.filter(
          (channel) => channel.dailyLimit <= daily_limit_max
        );
      }

      // 排序（如果指定了排序字段）
      if (sort_by) {
        transformedItems.sort((a: any, b: any) => {
          const aValue = a[sort_by];
          const bValue = b[sort_by];

          if (aValue === undefined || aValue === null) return 1;
          if (bValue === undefined || bValue === null) return -1;

          const dir = sort_dir === 'desc' ? -1 : 1;
          if (aValue > bValue) return dir;
          if (aValue < bValue) return -dir;
          return 0;
        });
      }

      // 重新计算分页（因为可能进行了客户端筛选）
      const total = transformedItems.length;
      const start = (page - 1) * page_size;
      const end = start + page_size;
      const paginatedItems = transformedItems.slice(start, end);

      // 按照前端期望的格式返回
      return NextResponse.json({
        total,
        page,
        page_size,
        list: paginatedItems
      });
    }

    // 如果远程 API 返回错误
    if (result.code !== 200 && result.code !== 0) {
      console.warn('[支付渠道列表] 远程API返回错误:', {
        code: result.code,
        msg: result.msg
      });
      return NextResponse.json(
        { code: 500, message: result.msg || '获取支付渠道列表失败' },
        { status: 500 }
      );
    }

    // 默认返回空列表
    return NextResponse.json({
      total: 0,
      page: 1,
      page_size: 20,
      list: []
    });
  } catch (error) {
    const requestDuration = Date.now() - requestStartTime;
    console.error('[支付渠道列表] 获取支付渠道列表失败:', {
      error: error instanceof Error ? error.message : String(error),
      requestDuration: `${requestDuration}ms`
    });
    return NextResponse.json(
      { code: 500, message: '获取支付渠道列表失败' },
      { status: 500 }
    );
  }
}
