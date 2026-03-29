// 将下划线格式转换为驼峰格式的工具函数
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// 递归转换对象的键名
function transformKeys(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeys);
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const transformed: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = snakeToCamel(key);
      transformed[camelKey] = transformKeys(obj[key]);
    }
  }
  return transformed;
}

// 将后端返回的订单数据转换为前端期望的格式
export function transformDepositOrder(order: any): any {
  // 先进行基本的键名转换
  const transformed = transformKeys(order);

  // 处理特殊字段映射
  if (order.order_no !== undefined) {
    transformed.orderNo = order.order_no;
  }
  if (order.channel_name !== undefined) {
    transformed.paymentChannelName = order.channel_name;
  }
  if (order.payment_channel_id !== undefined) {
    transformed.paymentChannelId = order.payment_channel_id;
  } else {
    // 如果没有 payment_channel_id，设置为 0 或从其他字段推断
    // 根据类型定义，paymentChannelId 是必需的，所以设置默认值
    transformed.paymentChannelId = 0;
  }
  if (order.channel_order_no !== undefined) {
    transformed.channelOrderNo = order.channel_order_no;
  }

  // 处理状态字段：将数字状态转换为字符串状态
  if (order.status !== undefined) {
    const statusMap: Record<number, string> = {
      1: 'pending',
      2: 'processing',
      3: 'success',
      4: 'failed',
      5: 'timeout'
    };
    transformed.status = statusMap[order.status] || 'pending';
  }

  // 处理金额字段，确保是数字类型
  if (order.amount !== undefined) {
    transformed.amount =
      typeof order.amount === 'string'
        ? parseFloat(order.amount) || 0
        : typeof order.amount === 'number'
          ? order.amount
          : 0;
  }
  if (order.fee !== undefined) {
    transformed.fee =
      typeof order.fee === 'string'
        ? parseFloat(order.fee) || 0
        : typeof order.fee === 'number'
          ? order.fee
          : 0;
  }
  if (order.bonus_amount !== undefined) {
    transformed.bonusAmount =
      typeof order.bonus_amount === 'string'
        ? parseFloat(order.bonus_amount) || 0
        : typeof order.bonus_amount === 'number'
          ? order.bonus_amount
          : 0;
  }
  if (order.actual_amount !== undefined) {
    if (order.actual_amount === null) {
      // 如果 actualAmount 为 null，保持为 null（待支付状态）
      transformed.actualAmount = null;
    } else {
      transformed.actualAmount =
        typeof order.actual_amount === 'string'
          ? parseFloat(order.actual_amount) || 0
          : typeof order.actual_amount === 'number'
            ? order.actual_amount
            : 0;
    }
  }

  // 处理时间字段
  if (order.created_at !== undefined) {
    transformed.createdAt = order.created_at;
  }
  if (order.completed_at !== undefined) {
    transformed.completedAt = order.completed_at;
  }
  if (order.updated_at !== undefined) {
    transformed.updatedAt = order.updated_at;
  }

  // 处理其他字段
  if (order.user_id !== undefined) {
    transformed.userId = order.user_id;
  }
  if (order.ip_address !== undefined) {
    transformed.ipAddress = order.ip_address;
  }
  // currency 字段可能不存在，设置默认值
  if (order.currency !== undefined) {
    transformed.currency = order.currency || 'CNY';
  } else {
    transformed.currency = 'CNY'; // 默认币种
  }

  // updatedAt 字段可能不存在，如果没有则使用 createdAt
  if (order.updated_at !== undefined) {
    transformed.updatedAt = order.updated_at;
  } else if (order.created_at !== undefined) {
    transformed.updatedAt = order.created_at;
  }

  // 移除不需要的字段（如 status_text）
  delete transformed.statusText;

  return transformed;
}

// 转换订单列表
export function transformDepositOrderList(orders: any[]): any[] {
  return orders.map(transformDepositOrder);
}
