import { apiRequest, buildSearchParams } from './base';

// ========== PRD §7.1 开奖记录 ==========
export interface SettlementRecord {
  settlement_id: string;
  asset: string;
  period: string;
  period_start: number;
  period_end: number;
  open_price: string;
  close_price: string;
  price_change_pct: string;
  price_source: string;
  total_orders: number;
  won_orders: number;
  lost_orders: number;
  refunded_orders: number;
  total_bet: number;
  total_payout: number;
  platform_profit: number;
  settled_at: number;
  status: string;
}

export interface SettlementRecordsResult {
  items: SettlementRecord[];
  pagination: { page: number; size: number; total: number };
}

export interface SettlementAuditResult {
  list: SettlementAuditRecord[];
  total?: number;
  page?: number;
  limit?: number;
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
  getRecords: (params: { page?: number; size?: number; period?: string; result?: string } = {}) => {
    const sp = new URLSearchParams();
    if (params.page) sp.set('page', String(params.page));
    if (params.size) sp.set('size', String(params.size));
    if (params.period) sp.set('period', params.period);
    if (params.result) sp.set('result', params.result);
    const qs = sp.toString();
    return apiRequest<SettlementRecordsResult>(`/admin/settlement/records${qs ? `?${qs}` : ''}`);
  },

  getRecordById: (id: string) =>
    apiRequest<SettlementRecord>(`/admin/settlement/records/${id}`),

  // 结算审计
  getAuditRecords: (params: { page?: number; limit?: number; periodId?: string; userId?: string; startDate?: string; endDate?: string }) =>
    apiRequest<SettlementAuditResult>('/admin/settlement/audit?' + buildSearchParams(params)),

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
