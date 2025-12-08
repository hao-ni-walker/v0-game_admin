import { apiRequest } from './base';
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

// 储值订单相关 API
export class DepositOrderAPI {
  // 获取储值订单列表
  static async getDepositOrders(params?: DepositOrderFilters): Promise<{
    success: boolean;
    data?: DepositOrderListResponse;
    message?: string;
    code?: number;
  }> {
    return apiRequest<DepositOrderListResponse>('/deposit-orders/list', {
      method: 'POST',
      body: JSON.stringify(params || {})
    });
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
