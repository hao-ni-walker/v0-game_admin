import { apiRequest } from './base';

export type FeeType = 'withdraw' | 'deposit' | 'trade';
export type FeeScope = 'platform' | 'currency' | 'user';

export interface FeeConfig {
  id: number;
  fee_type: FeeType;
  scope_type: FeeScope;
  currency_id: number | null;
  user_id: number | null;
  fee_rate: number;
  min_fee: number;
  gas: number;
  effective_from: string | null;
  effective_to: string | null;
  priority: number;
  is_active: boolean;
  reason: string | null;
}

export interface FeeConfigListResult {
  items: FeeConfig[];
}

export interface FeeCreateData {
  fee_type: FeeType;
  scope_type: FeeScope;
  currency_id?: number | null;
  user_id?: number | null;
  fee_rate: number;
  min_fee: number;
  gas: number;
  effective_from?: string | null;
  effective_to?: string | null;
  priority?: number;
  is_active?: boolean;
  reason?: string | null;
}

export interface FeeUpdateData {
  fee_rate?: number;
  min_fee?: number;
  gas?: number;
  effective_from?: string | null;
  effective_to?: string | null;
  priority?: number;
  is_active?: boolean;
  reason?: string | null;
}

export interface FeePreviewResult {
  fee_type: string;
  matched_scope: FeeScope | null;
  fee_rate: number | null;
  min_fee: number | null;
  gas: number | null;
  fee: number | null;
  matched_config_id: number | null;
}

export const FeeAPI = {
  getList(params: { fee_type?: FeeType; scope_type?: FeeScope; active_only?: boolean } = {}) {
    const sp = new URLSearchParams();
    if (params.fee_type) sp.set('fee_type', params.fee_type);
    if (params.scope_type) sp.set('scope_type', params.scope_type);
    if (params.active_only) sp.set('active_only', 'true');
    const qs = sp.toString();
    return apiRequest<FeeConfigListResult>(`/admin/fees${qs ? `?${qs}` : ''}`);
  },
  create(body: FeeCreateData) {
    return apiRequest<FeeConfig>('/admin/fees', { method: 'POST', body: JSON.stringify(body) });
  },
  update(id: number, body: FeeUpdateData) {
    return apiRequest<FeeConfig>(`/admin/fees/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },
  remove(id: number) {
    return apiRequest<{ id: number; deleted: boolean }>(`/admin/fees/${id}`, { method: 'DELETE' });
  },
  preview(params: { fee_type: FeeType; currency_id?: number; user_id?: number; amount: number }) {
    const sp = new URLSearchParams();
    sp.set('fee_type', params.fee_type);
    sp.set('amount', String(params.amount));
    if (params.currency_id !== undefined) sp.set('currency_id', String(params.currency_id));
    if (params.user_id !== undefined) sp.set('user_id', String(params.user_id));
    return apiRequest<FeePreviewResult>(`/admin/fees/preview?${sp.toString()}`);
  },
};
