import { apiRequest, buildSearchParams } from './base';
import type {
  WithdrawOrder,
  WithdrawOrderFilters,
  WithdrawOrderStats,
  UserWallet,
  WalletTransaction,
  PaymentChannel,
  RiskInfo,
  AuditOrderParams,
  MarkPayoutParams
} from '@/app/dashboard/orders/withdrawals/types';

export interface WithdrawOrderListResponse {
  data: WithdrawOrder[];
  stats: WithdrawOrderStats;
  pager: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WithdrawOrderDetailResponse {
  order: WithdrawOrder;
  userWallet?: UserWallet;
  transactions?: WalletTransaction[];
  riskInfo?: RiskInfo;
}

// 提现订单相关 API
export class WithdrawOrderAPI {
  // 获取提现订单列表
  static async getWithdrawOrders(params?: WithdrawOrderFilters): Promise<{
    success: boolean;
    data?: WithdrawOrderListResponse;
    message?: string;
    code?: number;
  }> {
    // 构建查询参数
    const queryParams: Record<string, any> = {};

    if (params) {
      // 分页参数
      if (params.page) queryParams.page = params.page;
      if (params.pageSize) queryParams.page_size = params.pageSize;

      // 筛选参数
      if (params.orderNo) queryParams.order_no = params.orderNo;
      if (params.channelOrderNo)
        queryParams.channel_order_no = params.channelOrderNo;
      if (params.userKeyword) queryParams.username = params.userKeyword;
      if (params.paymentChannelId)
        queryParams.payment_channel_id = params.paymentChannelId;

      // 状态处理
      if (params.statuses && params.statuses.length > 0) {
        queryParams.status = params.statuses[0];
      }

      // 时间范围
      if (params.createdFrom) queryParams.created_from = params.createdFrom;
      if (params.createdTo) queryParams.created_to = params.createdTo;

      // 金额范围
      if (params.minAmount) queryParams.min_amount = params.minAmount;
      if (params.maxAmount) queryParams.max_amount = params.maxAmount;
    }

    const queryString = buildSearchParams(queryParams);
    const endpoint = queryString
      ? `/admin/withdraw-orders?${queryString}`
      : '/admin/withdraw-orders';

    return apiRequest<WithdrawOrderListResponse>(endpoint, {
      method: 'GET'
    });
  }

  // 获取提现订单详情
  static async getWithdrawOrder(id: number): Promise<{
    success: boolean;
    data?: WithdrawOrderDetailResponse;
    message?: string;
    code?: number;
  }> {
    return apiRequest<WithdrawOrderDetailResponse>(`/withdraw-orders/${id}`);
  }

  // 获取统计概览
  static async getStats(filters?: WithdrawOrderFilters): Promise<{
    success: boolean;
    data?: WithdrawOrderStats;
    message?: string;
    code?: number;
  }> {
    return apiRequest<WithdrawOrderStats>('/withdraw-orders/stats', {
      method: 'POST',
      body: JSON.stringify(filters || {})
    });
  }

  // 导出订单
  static async exportOrders(filters?: WithdrawOrderFilters): Promise<{
    success: boolean;
    data?: { taskId: string; message: string };
    message?: string;
    code?: number;
  }> {
    return apiRequest<{ taskId: string; message: string }>(
      '/withdraw-orders/export',
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
      body: JSON.stringify({ type: 2 }) // 2=提现渠道
    });
  }

  // 审核订单
  static async auditOrder(params: AuditOrderParams): Promise<{
    success: boolean;
    data?: WithdrawOrder;
    message?: string;
    code?: number;
  }> {
    return apiRequest<WithdrawOrder>(
      `/withdraw-orders/${params.orderId}/audit`,
      {
        method: 'POST',
        body: JSON.stringify({
          action: params.action,
          remark: params.remark
        })
      }
    );
  }

  // 批量审核订单
  static async batchAuditOrders(
    orderIds: number[],
    action: 'approve' | 'reject',
    remark: string
  ): Promise<{
    success: boolean;
    data?: { successCount: number; failedCount: number };
    message?: string;
    code?: number;
  }> {
    return apiRequest<{ successCount: number; failedCount: number }>(
      '/withdraw-orders/batch-audit',
      {
        method: 'POST',
        body: JSON.stringify({
          orderIds,
          action,
          remark
        })
      }
    );
  }

  // 标记出款结果
  static async markPayoutResult(params: MarkPayoutParams): Promise<{
    success: boolean;
    data?: WithdrawOrder;
    message?: string;
    code?: number;
  }> {
    return apiRequest<WithdrawOrder>(
      `/withdraw-orders/${params.orderId}/mark-payout`,
      {
        method: 'POST',
        body: JSON.stringify({
          action: params.action,
          channelOrderNo: params.channelOrderNo,
          failureReason: params.failureReason
        })
      }
    );
  }

  // 更新订单备注
  static async updateOrderRemark(
    id: number,
    remark: string
  ): Promise<{
    success: boolean;
    data?: WithdrawOrder;
    message?: string;
    code?: number;
  }> {
    return apiRequest<WithdrawOrder>(`/withdraw-orders/${id}/remark`, {
      method: 'PATCH',
      body: JSON.stringify({ remark })
    });
  }
}
