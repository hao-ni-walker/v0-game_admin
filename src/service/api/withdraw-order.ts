import { apiRequest } from './base';
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
    return apiRequest<WithdrawOrderListResponse>('/withdraw-orders/list', {
      method: 'POST',
      body: JSON.stringify(params || {})
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
