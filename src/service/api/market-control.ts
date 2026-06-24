import { apiRequest } from './base';

export interface PeriodRiskStatus {
  period: string;
  net_exposure: number;
  long_amount: number;
  short_amount: number;
  risk_level: string;
  odds_status: string;
  is_accepting: boolean;
  dominant_side: string | null;
}
export interface RiskStatus {
  overall_level: string;
  periods: PeriodRiskStatus[];
  single_side_triggered: boolean;
}
export interface RiskEventItem {
  event_id: string;
  type: string;
  period: string | null;
  trigger_condition: string | null;
  trigger_value: string | null;
  threshold: string | null;
  operator: string | null;
  reason: string | null;
  created_at: number;
  resolved_at: number | null;
}
export interface RiskEventsResult {
  items: RiskEventItem[];
  pagination: { page: number; size: number; total: number };
}
export interface RiskEventsQuery {
  type?: string;
  period?: string;
  start_time?: number;
  end_time?: number;
  page?: number;
  size?: number;
}

export const MarketControlAPI = {
  getStatus: () => apiRequest<RiskStatus>('/admin/risk/status'),
  zeroOdds: (period: string, reason: string) =>
    apiRequest<unknown>('/admin/risk/odds/zero', { method: 'POST', body: JSON.stringify({ period, reason }) }),
  zeroAll: (reason: string, notify_users: boolean) =>
    apiRequest<unknown>('/admin/risk/odds/zero-all', { method: 'POST', body: JSON.stringify({ reason, notify_users }) }),
  restoreOdds: (period: string, reason: string) =>
    apiRequest<unknown>('/admin/risk/odds/restore', { method: 'POST', body: JSON.stringify({ period, reason }) }),
  restoreAll: (reason: string, notify_users: boolean) =>
    apiRequest<unknown>('/admin/risk/odds/restore-all', { method: 'POST', body: JSON.stringify({ reason, notify_users }) }),
  closeDirection: (period: string, direction: 'UP' | 'DOWN', reason: string) =>
    apiRequest<unknown>('/admin/risk/direction/close', { method: 'POST', body: JSON.stringify({ period, direction, reason }) }),
  restoreDirection: (period: string, direction: 'UP' | 'DOWN', reason: string) =>
    apiRequest<unknown>('/admin/risk/direction/restore', { method: 'POST', body: JSON.stringify({ period, direction, reason }) }),
  getEvents: (params: RiskEventsQuery = {}) => {
    const sp = new URLSearchParams();
    if (params.type) sp.set('type', params.type);
    if (params.period) sp.set('period', params.period);
    if (params.start_time) sp.set('start_time', String(params.start_time));
    if (params.end_time) sp.set('end_time', String(params.end_time));
    if (params.page) sp.set('page', String(params.page));
    if (params.size) sp.set('size', String(params.size));
    const qs = sp.toString();
    return apiRequest<RiskEventsResult>(`/admin/risk/events${qs ? `?${qs}` : ''}`);
  },
};
