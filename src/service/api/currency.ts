import { apiRequest } from './base';

export interface Currency {
  id: number;
  code: string;
  symbol: string;
  name: string;
  display_precision: number;
  icon_url: string | null;
  is_tradeable: boolean;
  is_depositable: boolean;
  is_withdrawable: boolean;
  sort_order: number;
  status: string;
}

export interface CurrencyListResult {
  items: Currency[];
}

// Create/edit payload. NOTE: is_tradeable is intentionally excluded —
// activation goes through toggle() (backend gates on all-4 base odds).
export interface CurrencyFormData {
  code: string;
  symbol: string;
  name: string;
  display_precision: number;
  icon_url?: string | null;
  is_depositable: boolean;
  is_withdrawable: boolean;
  sort_order: number;
}

export interface CurrencyUpdateData {
  symbol?: string;
  name?: string;
  display_precision?: number;
  icon_url?: string | null;
  is_depositable?: boolean;
  is_withdrawable?: boolean;
  sort_order?: number;
}

export const CurrencyAPI = {
  getList(params: { is_tradeable?: boolean } = {}) {
    const sp = new URLSearchParams();
    if (params.is_tradeable !== undefined) sp.set('is_tradeable', String(params.is_tradeable));
    const qs = sp.toString();
    return apiRequest<CurrencyListResult>(`/admin/currencies${qs ? `?${qs}` : ''}`);
  },
  create(body: CurrencyFormData) {
    return apiRequest<Currency>('/admin/currencies', { method: 'POST', body: JSON.stringify(body) });
  },
  update(id: number, body: CurrencyUpdateData) {
    return apiRequest<Currency>(`/admin/currencies/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },
  remove(id: number) {
    return apiRequest<{ id: number; deleted: boolean }>(`/admin/currencies/${id}`, { method: 'DELETE' });
  },
  toggle(id: number, is_tradeable: boolean) {
    return apiRequest<Currency>(`/admin/currencies/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ is_tradeable }),
    });
  },
};
