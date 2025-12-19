import { apiRequest, buildSearchParams } from './base';
import type {
  DepositOrder,
  DepositOrderFilters,
  DepositOrderStats,
  UserWallet,
  WalletTransaction,
  PaymentChannel
} from '@/app/dashboard/orders/deposits/types';

export interface DepositOrderListResponse {
  data: DepositOrder[];
  stats: DepositOrderStats;
  pager: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DepositOrderDetailResponse {
  order: DepositOrder;
  userWallet?: UserWallet;
  transactions?: WalletTransaction[];
}

// 接口返回的原始订单数据（snake_case）
interface RawDepositOrder {
  id: number;
  order_no: string;
  user_id: number;
  username?: string;
  channel_name?: string;
  amount: string | number;
  fee: string | number;
  bonus_amount: string | number;
  actual_amount: string | number | null;
  status: number;
  status_text?: string;
  created_at: string;
  completed_at?: string | null;
  remark?: string | null;
}

// 接口返回的列表响应（snake_case）
interface RawDepositOrderListResponse {
  items: RawDepositOrder[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 状态映射：数字 -> 字符串
const STATUS_MAP: Record<number, DepositOrder['status']> = {
  1: 'pending', // 待支付
  2: 'processing', // 支付中
  3: 'success', // 成功
  4: 'failed', // 失败
  5: 'timeout' // 超时
};

// 将接口返回的原始订单数据转换为应用使用的格式
function transformDepositOrder(raw: RawDepositOrder): DepositOrder {
  return {
    id: raw.id,
    orderNo: raw.order_no,
    channelOrderNo: null,
    userId: raw.user_id,
    username: raw.username,
    nickname: undefined,
    phone: undefined,
    email: undefined,
    paymentChannelId: 0, // 接口未返回，设为默认值
    paymentChannelName: raw.channel_name,
    paymentChannelCode: raw.channel_name,
    amount:
      typeof raw.amount === 'string' ? parseFloat(raw.amount) : raw.amount,
    fee: typeof raw.fee === 'string' ? parseFloat(raw.fee) : raw.fee,
    bonusAmount:
      typeof raw.bonus_amount === 'string'
        ? parseFloat(raw.bonus_amount)
        : raw.bonus_amount,
    actualAmount:
      raw.actual_amount === null
        ? 0
        : typeof raw.actual_amount === 'string'
          ? parseFloat(raw.actual_amount)
          : raw.actual_amount,
    status: STATUS_MAP[raw.status] || 'pending',
    currency: 'CNY', // 接口未返回，设为默认值
    ipAddress: null,
    remark: raw.remark || null,
    createdAt: raw.created_at,
    completedAt: raw.completed_at || null,
    updatedAt: raw.created_at // 接口未返回，使用创建时间
  };
}

// 将筛选参数转换为接口期望的格式
function transformFiltersToParams(
  filters?: DepositOrderFilters
): Record<string, any> {
  if (!filters) return {};

  const params: Record<string, any> = {};

  // 分页参数
  if (filters.page !== undefined) {
    params.page = filters.page;
  }
  if (filters.pageSize !== undefined) {
    params.page_size = filters.pageSize;
  }

  // 订单号
  if (filters.orderNo) {
    params.order_no = filters.orderNo;
  }

  // 用户关键词
  if (filters.userKeyword) {
    params.user_keyword = filters.userKeyword;
  }

  // 支付渠道ID
  if (filters.paymentChannelId) {
    params.payment_channel_id = filters.paymentChannelId;
  }

  // 状态（将字符串数组转换为数字数组）
  if (filters.statuses && filters.statuses.length > 0) {
    const statusMap: Record<string, number> = {
      pending: 1,
      processing: 2,
      success: 3,
      failed: 4,
      timeout: 5
    };
    params.status = filters.statuses.map((s) => statusMap[s] || 1);
  }

  // 时间范围
  if (filters.createdFrom) {
    params.created_from = filters.createdFrom;
  }
  if (filters.createdTo) {
    params.created_to = filters.createdTo;
  }

  // 金额范围
  if (filters.minAmount !== undefined) {
    params.min_amount = filters.minAmount;
  }
  if (filters.maxAmount !== undefined) {
    params.max_amount = filters.maxAmount;
  }

  // 币种
  if (filters.currency) {
    params.currency = filters.currency;
  }

  // IP地址
  if (filters.ipAddress) {
    params.ip_address = filters.ipAddress;
  }

  return params;
}

// 储值订单相关 API
export class DepositOrderAPI {
  // 获取储值订单列表
  static async getDepositOrders(params?: DepositOrderFilters): Promise<{
    success: boolean;
    data?: DepositOrderListResponse;
    message?: string;
    code?: number;
  }> {
    // 转换筛选参数
    const queryParams = transformFiltersToParams(params);
    const queryString = buildSearchParams(queryParams);
    const endpoint = `/admin/deposit-orders${queryString ? `?${queryString}` : ''}`;

    // 使用 GET 请求
    const response = await apiRequest<RawDepositOrderListResponse>(endpoint, {
      method: 'GET'
    });

    if (!response.success || !response.data) {
      return {
        success: false,
        message: response.message || '获取订单列表失败',
        code: response.code
      };
    }

    // 转换数据格式
    const rawData = response.data;
    const transformedData: DepositOrderListResponse = {
      data: rawData.items.map(transformDepositOrder),
      stats: {
        // 接口未返回统计信息，使用默认值或从订单列表计算
        orderCount: rawData.total,
        totalAmount: 0,
        totalActualAmount: 0,
        totalBonusAmount: 0
      },
      pager: {
        page: rawData.page,
        limit: rawData.page_size,
        total: rawData.total,
        totalPages: rawData.total_pages
      }
    };

    // 计算统计数据（从订单列表）
    transformedData.stats.totalAmount = transformedData.data.reduce(
      (sum, order) => sum + order.amount,
      0
    );
    transformedData.stats.totalActualAmount = transformedData.data.reduce(
      (sum, order) => sum + order.actualAmount,
      0
    );
    transformedData.stats.totalBonusAmount = transformedData.data.reduce(
      (sum, order) => sum + order.bonusAmount,
      0
    );

    return {
      success: true,
      data: transformedData,
      message: response.message,
      code: response.code
    };
  }

  // 获取储值订单详情
  static async getDepositOrder(id: number): Promise<{
    success: boolean;
    data?: DepositOrderDetailResponse;
    message?: string;
    code?: number;
  }> {
    return apiRequest<DepositOrderDetailResponse>(`/deposit-orders/${id}`);
  }

  // 获取统计概览
  static async getStats(filters?: DepositOrderFilters): Promise<{
    success: boolean;
    data?: DepositOrderStats;
    message?: string;
    code?: number;
  }> {
    return apiRequest<DepositOrderStats>('/deposit-orders/stats', {
      method: 'POST',
      body: JSON.stringify(filters || {})
    });
  }

  // 导出订单
  static async exportOrders(filters?: DepositOrderFilters): Promise<{
    success: boolean;
    data?: { taskId: string; message: string };
    message?: string;
    code?: number;
  }> {
    return apiRequest<{ taskId: string; message: string }>(
      '/deposit-orders/export',
      {
        method: 'POST',
        body: JSON.stringify(filters || {})
      }
    );
  }

  // 获取支付渠道列表
  static async getPaymentChannels(): Promise<{
    success: boolean;
    data?: PaymentChannel[];
    message?: string;
    code?: number;
  }> {
    return apiRequest<PaymentChannel[]>('/payment-channels/list', {
      method: 'POST',
      body: JSON.stringify({ type: 1 }) // 1=充值渠道
    });
  }

  // 更新订单备注
  static async updateOrderRemark(
    id: number,
    remark: string
  ): Promise<{
    success: boolean;
    data?: DepositOrder;
    message?: string;
    code?: number;
  }> {
    return apiRequest<DepositOrder>(`/deposit-orders/${id}/remark`, {
      method: 'PATCH',
      body: JSON.stringify({ remark })
    });
  }
}
