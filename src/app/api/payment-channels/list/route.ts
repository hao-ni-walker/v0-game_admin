import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/payment-channels/list
 * 获取支付渠道列表(带筛选和分页)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      page = 1,
      page_size = 20,
      keyword,
      types,
      channel_types,
      status,
      disabled = false,
      show_removed = false,
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
      sort_by = 'type',
      sort_dir = 'asc'
    } = body;

    // 导入模拟数据
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataPath = path.join(process.cwd(), 'data', 'paymentChannels.json');
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const allChannels = JSON.parse(fileContent);

    // 筛选逻辑
    let filteredChannels = [...allChannels];

    // 关键词搜索 (name, code)
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filteredChannels = filteredChannels.filter(
        (channel) =>
          channel.name?.toLowerCase().includes(lowerKeyword) ||
          channel.code?.toLowerCase().includes(lowerKeyword)
      );
    }

    // 类型筛选 (充值/提现)
    if (types && types.length > 0) {
      filteredChannels = filteredChannels.filter((channel) =>
        types.includes(channel.type)
      );
    }

    // 渠道类型筛选 (alipay/wechat/usdt等)
    if (channel_types && channel_types.length > 0) {
      filteredChannels = filteredChannels.filter((channel) =>
        channel_types.includes(channel.channelType)
      );
    }

    // 状态筛选
    if (status !== undefined && status !== 'all') {
      filteredChannels = filteredChannels.filter(
        (channel) => channel.status === status
      );
    }

    // 禁用筛选
    if (disabled !== undefined) {
      filteredChannels = filteredChannels.filter(
        (channel) => channel.disabled === disabled
      );
    }

    // 删除筛选
    if (!show_removed) {
      filteredChannels = filteredChannels.filter((channel) => !channel.removed);
    }

    // 金额区间筛选
    if (min_amount_maxlte !== undefined) {
      filteredChannels = filteredChannels.filter(
        (channel) => channel.minAmount <= min_amount_maxlte
      );
    }
    if (max_amount_mingte !== undefined) {
      filteredChannels = filteredChannels.filter(
        (channel) => channel.maxAmount >= max_amount_mingte
      );
    }

    // 费率区间筛选
    if (fee_rate_min !== undefined) {
      filteredChannels = filteredChannels.filter(
        (channel) => channel.feeRate >= fee_rate_min
      );
    }
    if (fee_rate_max !== undefined) {
      filteredChannels = filteredChannels.filter(
        (channel) => channel.feeRate <= fee_rate_max
      );
    }

    // 固定费用区间筛选
    if (fixed_fee_min !== undefined) {
      filteredChannels = filteredChannels.filter(
        (channel) => channel.fixedFee >= fixed_fee_min
      );
    }
    if (fixed_fee_max !== undefined) {
      filteredChannels = filteredChannels.filter(
        (channel) => channel.fixedFee <= fixed_fee_max
      );
    }

    // 每日限额区间筛选
    if (daily_limit_min !== undefined) {
      filteredChannels = filteredChannels.filter(
        (channel) => channel.dailyLimit >= daily_limit_min
      );
    }
    if (daily_limit_max !== undefined) {
      filteredChannels = filteredChannels.filter(
        (channel) => channel.dailyLimit <= daily_limit_max
      );
    }

    // 时间范围筛选
    if (created_from) {
      filteredChannels = filteredChannels.filter(
        (channel) => new Date(channel.createdAt) >= new Date(created_from)
      );
    }
    if (created_to) {
      filteredChannels = filteredChannels.filter(
        (channel) => new Date(channel.createdAt) <= new Date(created_to)
      );
    }
    if (updated_from) {
      filteredChannels = filteredChannels.filter(
        (channel) => new Date(channel.updatedAt) >= new Date(updated_from)
      );
    }
    if (updated_to) {
      filteredChannels = filteredChannels.filter(
        (channel) => new Date(channel.updatedAt) <= new Date(updated_to)
      );
    }

    // 排序逻辑
    // 默认排序: type升序(充值在前), 然后sort_order降序, 然后updated_at降序, 再id降序
    filteredChannels.sort((a, b) => {
      // 自定义排序字段
      if (sort_by && sort_by !== 'type') {
        const aValue = a[sort_by as keyof typeof a];
        const bValue = b[sort_by as keyof typeof b];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        if (sort_dir === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      }

      // 默认排序
      // 1. type升序
      if (a.type !== b.type) {
        return a.type - b.type;
      }
      // 2. sortOrder降序
      if (a.sortOrder !== b.sortOrder) {
        return b.sortOrder - a.sortOrder;
      }
      // 3. updatedAt降序
      const aUpdated = new Date(a.updatedAt).getTime();
      const bUpdated = new Date(b.updatedAt).getTime();
      if (aUpdated !== bUpdated) {
        return bUpdated - aUpdated;
      }
      // 4. id降序
      return b.id - a.id;
    });

    // 分页
    const total = filteredChannels.length;
    const start = (page - 1) * page_size;
    const end = start + page_size;
    const paginatedChannels = filteredChannels.slice(start, end);

    // 按照规范返回: total, page, page_size, list
    return NextResponse.json({
      total,
      page,
      page_size,
      list: paginatedChannels
    });
  } catch (error) {
    console.error('获取支付渠道列表失败:', error);
    return NextResponse.json(
      { code: 500, message: '获取支付渠道列表失败', data: null },
      { status: 500 }
    );
  }
}
