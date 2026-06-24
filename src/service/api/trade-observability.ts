import { apiRequest, buildSearchParams } from './base';

export interface TradeFailureItem {
  id: number;
  user_id: number | null;
  email: string | null;
  asset: string | null;
  direction: string | null;
  period: string | null;
  amount: number | null;
  error_code: number;
  error_message: string;
  error_data: string | null;
  trace_id: string | null;
  source: string | null;
  created_at: number | null;
}

export interface TradeFailureCodeStat {
  error_code: number;
  count: number;
}

export interface TradeFailuresResult {
  items: TradeFailureItem[];
  stats: {
    window_minutes: number;
    total_recent: number;
    by_code: TradeFailureCodeStat[];
  };
  pagination: { page: number; size: number; total: number };
}

export interface TradeOrderItem {
  id: number;
  user_id: number;
  email: string | null;
  display_name: string | null;
  asset: string;
  direction: 'UP' | 'DOWN';
  amount: number;
  payout_percent: number;
  period: string;
  odds_at_creation: number;
  entry_price: number;
  exit_price: number | null;
  status: string;
  result: string | null;
  profit: number | null;
  payout: number | null;
  opened_at: number | null;
  expires_at: number | null;
  settled_at: number | null;
}

export interface TradeOrderStatusStat {
  status: string;
  count: number;
}

export interface TradeOrdersResult {
  items: TradeOrderItem[];
  stats: {
    total: number;
    total_amount: number;
    pending_amount: number;
    by_status: TradeOrderStatusStat[];
  };
  pagination: { page: number; size: number; total: number };
}

export interface TradeOrderQuery {
  status?: string;
  email?: string;
  asset?: string;
  period?: string;
  direction?: 'UP' | 'DOWN' | '';
  user_id?: number;
  order_id?: number;
  page?: number;
  size?: number;
}

export interface TradeFailureQuery {
  error_code?: number;
  email?: string;
  asset?: string;
  period?: string;
  since_id?: number;
  minutes?: number;
  page?: number;
  size?: number;
}

export const TradeObservabilityAPI = {
  getOrders: (params: TradeOrderQuery = {}) => {
    const qs = buildSearchParams(params);
    return apiRequest<TradeOrdersResult>(`/admin/trade/orders${qs ? `?${qs}` : ''}`);
  },
  getFailures: (params: TradeFailureQuery = {}) => {
    const qs = buildSearchParams(params);
    return apiRequest<TradeFailuresResult>(`/admin/trade/failures${qs ? `?${qs}` : ''}`);
  },
};
