import { apiRequest } from './base';

export interface OddsConfig {
  id: number;
  currency_id: number;
  period: string;
  payout_percent: number;
  is_base: boolean;
  is_active: boolean;
  priority: number;
  effective_from: string | null;
  effective_to: string | null;
  reason: string | null;
}

export interface OddsConfigListResult {
  items: OddsConfig[];
}

export interface ResolvedPeriod {
  period: string;
  duration_minutes: number;
  payout_percent: number;
  is_available: boolean;
  reason: string | null;
}

export interface ResolvedOddsResult {
  odds: ResolvedPeriod[];
}

export interface OddsUpsertData {
  currency_id: number;
  period: string;
  payout_percent: number;
  is_base: boolean;
  effective_from?: string | null;
  effective_to?: string | null;
  priority?: number;
  is_active?: boolean;
  reason?: string | null;
}

export interface OddsUpdateData {
  payout_percent?: number;
  effective_from?: string | null;
  effective_to?: string | null;
  priority?: number;
  is_active?: boolean;
  reason?: string | null;
}

export const OddsAPI = {
  getList(params: { currency_id?: number; active_only?: boolean } = {}) {
    const sp = new URLSearchParams();
    if (params.currency_id !== undefined) sp.set('currency_id', String(params.currency_id));
    if (params.active_only) sp.set('active_only', 'true');
    const qs = sp.toString();
    return apiRequest<OddsConfigListResult>(`/admin/odds/configs${qs ? `?${qs}` : ''}`);
  },
  upsert(body: OddsUpsertData) {
    return apiRequest<OddsConfig>('/admin/odds/configs', { method: 'POST', body: JSON.stringify(body) });
  },
  update(id: number, body: OddsUpdateData) {
    return apiRequest<OddsConfig>(`/admin/odds/configs/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },
  remove(id: number) {
    return apiRequest<{ id: number; deleted: boolean }>(`/admin/odds/configs/${id}`, { method: 'DELETE' });
  },
  getResolved(currency: string) {
    const qs = new URLSearchParams({ currency }).toString();
    return apiRequest<ResolvedOddsResult>(`/admin/odds/config?${qs}`);
  },
};
