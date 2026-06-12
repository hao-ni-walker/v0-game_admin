import { apiRequest, buildSearchParams } from './base';

// ========== PRD §7.1 开奖记录 ==========
export interface SettlementRecord {
  id: string;
  period: string;
  openTime: string;
  openPrice: number;
  priceSource: string;
  totalOrders: number;
  longOrders: number;
  shortOrders: number;
  result: 'up' | 'down' | 'draw';
  settled: boolean;
}

// ========== PRD §11.2 结算审计 ==========
export interface SettlementAuditRecord {
  orderId: string;
  userId: string;
  period: string;
  direction: 'up' | 'down';
  amount: number;
  openPrice: number;
  openPriceTimestamp: string;
  closePrice: number;
  closePriceTimestamp: string;
  odds: number;
  result: 'win' | 'lose' | 'draw';
  payout: number;
  settledAt: string;
  priceSource: string;
}

// ========== PRD §7.4 异常结算 ==========
export interface SettlementException {
  id: string;
  period: string;
  exceptionType: 'price_source_error' | 'system_timeout' | 'user_complaint' | 'batch_failure';
  description: string;
  status: 'pending' | 'processing' | 'resolved';
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface ManualSettlementParams {
  periodId: string;
  manualPrice: number;
  sourceScreenshot?: string;
  reason: string;
}

// ========== 结算 API ==========
export const SettlementAPI = {
  // 开奖记录
  getRecords: (params: { page?: number; limit?: number; period?: string; startDate?: string; endDate?: string }) =>
    apiRequest<{ list: SettlementRecord[] }>('/admin/settlement/records?' + buildSearchParams(params)),

  getRecordById: (id: string) =>
    apiRequest<SettlementRecord>(`/admin/settlement/records/${id}`),

  // 结算审计
  getAuditRecords: (params: { page?: number; limit?: number; periodId?: string; userId?: string; startDate?: string; endDate?: string }) =>
    apiRequest<{ list: SettlementAuditRecord[] }>('/admin/settlement/audit?' + buildSearchParams(params)),

  // 异常结算
  getExceptions: (params: { page?: number; limit?: number; status?: string }) =>
    apiRequest<{ list: SettlementException[] }>('/admin/settlement/exceptions?' + buildSearchParams(params)),

  resolveException: (id: string, data: { resolution: string; note?: string }) =>
    apiRequest<void>(`/admin/settlement/exceptions/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 手动触发结算
  manualSettle: (params: ManualSettlementParams) =>
    apiRequest<void>('/admin/settlement/manual', {
      method: 'POST',
      body: JSON.stringify(params)
    }),

  // 重试失败结算
  retrySettlement: (periodId: string) =>
    apiRequest<void>(`/admin/settlement/retry/${periodId}`, {
      method: 'POST'
    })
};
