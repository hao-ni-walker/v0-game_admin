import { apiRequest, buildSearchParams, ApiResponse } from './base';

// ========== PRD §3 风险敞口 ==========
export interface RiskExposure {
  period: string;
  longExposure: number;
  shortExposure: number;
  netExposure: number;
  maxLoss: number;
  level: 'normal' | 'warning' | 'high' | 'extreme';
}

export interface RiskExposureResponse {
  exposures: RiskExposure[];
  totalNetExposure: number;
  totalMaxLoss: number;
  pendingOrders: number;
}

// ========== PRD §4 赔率管理 ==========
export interface OddsConfig {
  period: string;
  baseOdds: number;
  minOdds: number;
  maxOdds: number;
  currentOddsUp: number;
  currentOddsDown: number;
  dynamicK: number; // 调节系数
}

export interface OddsHistoryRecord {
  id: string;
  time: string;
  period: string;
  beforeOdds: number;
  afterOdds: number;
  triggerType: 'auto' | 'manual';
  operator?: string;
  reason: string;
}

export interface UpdateOddsParams {
  period: string;
  newOdds: number;
  effectiveTime: 'immediate' | 'next_period';
  reason: string;
}

// ========== PRD §5 限额配置 ==========
export interface LimitConfig {
  category: 'single_bet' | 'user_period' | 'platform' | 'cutoff';
  params: Record<string, number | string>;
}

// ========== PRD §3.4 单边行情 ==========
export interface MarketControlState {
  period: string;
  isActive: boolean;
  triggerCondition?: 'price' | 'order_ratio' | 'exposure';
  triggerTime?: string;
}

export interface MarketEvent {
  id: string;
  time: string;
  period: string;
  triggerCondition: string;
  details: string;
  status: 'active' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
}

// ========== PRD §9 异常行为检测 ==========
export interface AnomalyRule {
  id: string;
  name: string;
  enabled: boolean;
  threshold: Record<string, number | string>;
}

export interface AnomalyRecord {
  id: string;
  ruleId: string;
  ruleName: string;
  userId: string;
  triggeredAt: string;
  details: string;
  handledBy?: string;
  handledAt?: string;
  status: 'pending' | 'handled';
}

// ========== 风控 API ==========
export const RiskControlAPI = {
  // 风险敞口
  getExposure: () =>
    apiRequest<RiskExposureResponse>('/admin/risk/exposure'),

  // 赔率管理
  getOddsConfig: () =>
    apiRequest<OddsConfig[]>('/admin/risk/odds'),

  updateOdds: (params: UpdateOddsParams) =>
    apiRequest<void>('/admin/risk/odds', {
      method: 'PUT',
      body: JSON.stringify(params)
    }),

  resetOdds: (period: string, reason: string) =>
    apiRequest<void>('/admin/risk/odds/reset', {
      method: 'POST',
      body: JSON.stringify({ period, reason })
    }),

  zeroOdds: (period: string, reason: string) =>
    apiRequest<void>('/admin/risk/odds/zero', {
      method: 'POST',
      body: JSON.stringify({ period, reason })
    }),

  zeroAllOdds: (reason: string) =>
    apiRequest<void>('/admin/risk/odds/zero-all', {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  getOddsHistory: (params: { page?: number; limit?: number; period?: string }) =>
    apiRequest<{ list: OddsHistoryRecord[] }>('/admin/risk/odds/history?' + buildSearchParams(params)),

  // 限额配置
  getLimits: () =>
    apiRequest<LimitConfig[]>('/admin/risk/limits'),

  updateLimits: (params: LimitConfig) =>
    apiRequest<void>('/admin/risk/limits', {
      method: 'PUT',
      body: JSON.stringify(params)
    }),

  // 单边行情
  getMarketControlStates: () =>
    apiRequest<MarketControlState[]>('/admin/risk/market-control'),

  getMarketEvents: (params: { page?: number; limit?: number }) =>
    apiRequest<{ list: MarketEvent[] }>('/admin/risk/market-control/events?' + buildSearchParams(params)),

  recoverMarket: (period: string, reason: string) =>
    apiRequest<void>('/admin/risk/market-control/recover', {
      method: 'POST',
      body: JSON.stringify({ period, reason })
    }),

  // 异常行为检测
  getAnomalyRules: () =>
    apiRequest<AnomalyRule[]>('/admin/risk/anomaly/rules'),

  updateAnomalyRule: (ruleId: string, threshold: Record<string, number | string>) =>
    apiRequest<void>(`/admin/risk/anomaly/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify({ threshold })
    }),

  getAnomalyRecords: (params: { page?: number; limit?: number; ruleId?: string }) =>
    apiRequest<{ list: AnomalyRecord[] }>('/admin/risk/anomaly/records?' + buildSearchParams(params))
};
