import { apiRequest } from './base';

/** Polymarket 预测市场目录行（prediction_markets 表，Gamma 同步 + 运营字段）。 */
export interface PredictionMarket {
  id: number;
  market_id: string;
  condition_id: string | null;
  slug: string;
  question: string;
  category: string | null;
  icon: string | null;
  image: string | null;
  outcomes: string[] | null;
  outcome_prices: string[] | null;
  end_date: string | null;
  active: boolean;
  closed: boolean;
  archived: boolean;
  accepting_orders: boolean | null;
  liquidity_num: number;
  volume_num: number;
  volume_24hr: number;
  best_bid: number | null;
  best_ask: number | null;
  last_trade_price: number | null;
  synced_at: string;
  is_listed: boolean;
  listed_at: string | null;
  spread_bps: number | null;
  max_exposure_usdt: number | null;
  min_bet_usdt: number | null;
  max_bet_usdt: number | null;
  sort_order: number;
}

/** 上架校验不通过的原因（详情接口返回；空数组 = 可上架）。 */
export interface PredictionMarketDetail extends PredictionMarket {
  listing_blockers: string[];
}

export interface PredictionMarketListResult {
  items: PredictionMarket[];
  total: number;
  page: number;
  page_size: number;
}

export interface PredictionSyncStatus {
  running: boolean;
  enabled: boolean;
  last_stats: Record<string, number> | null;
  last_error: string | null;
  last_finished_at: string | null;
}

export interface PredictionMarketListParams {
  q?: string;
  is_listed?: boolean;
  closed?: boolean;
  category?: string;
  page?: number;
  page_size?: number;
}

/** 上架配置（运营字段）。字段留空 = 不设置，回落全局默认。 */
export interface PredictionMarketUpdateData {
  spread_bps?: number | null;
  max_exposure_usdt?: number | null;
  min_bet_usdt?: number | null;
  max_bet_usdt?: number | null;
  sort_order?: number;
}

export const PredictionMarketAPI = {
  getList(params: PredictionMarketListParams = {}) {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.is_listed !== undefined) sp.set('is_listed', String(params.is_listed));
    if (params.closed !== undefined) sp.set('closed', String(params.closed));
    if (params.category) sp.set('category', params.category);
    if (params.page) sp.set('page', String(params.page));
    if (params.page_size) sp.set('page_size', String(params.page_size));
    const qs = sp.toString();
    return apiRequest<PredictionMarketListResult>(
      `/admin/prediction-markets${qs ? `?${qs}` : ''}`
    );
  },

  getDetail(id: number) {
    return apiRequest<PredictionMarketDetail>(`/admin/prediction-markets/${id}`);
  },

  update(id: number, body: PredictionMarketUpdateData) {
    return apiRequest<PredictionMarket>(`/admin/prediction-markets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  toggle(id: number, is_listed: boolean) {
    return apiRequest<PredictionMarket>(`/admin/prediction-markets/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ is_listed }),
    });
  },

  triggerSync() {
    return apiRequest<{ triggered: boolean }>('/admin/prediction-markets/sync', {
      method: 'POST',
    });
  },

  getSyncStatus() {
    return apiRequest<PredictionSyncStatus>('/admin/prediction-markets/sync-status');
  },
};
