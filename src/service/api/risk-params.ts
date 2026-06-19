import { apiRequest } from './base';

export interface RiskParamItem {
  key: string;
  value: unknown;
  scope: string;
  version: number;
  updated_by: string | null;
  updated_at: number;
}

export interface RiskParamListResult {
  items: RiskParamItem[];
}

export interface RiskParamUpsertData {
  value: unknown;
  scope?: string;
  reason: string;
}

export const RiskParamAPI = {
  getList() {
    return apiRequest<RiskParamListResult>('/admin/risk/params');
  },
  upsert(key: string, body: RiskParamUpsertData) {
    return apiRequest<RiskParamItem>(
      `/admin/risk/params/${encodeURIComponent(key)}`,
      { method: 'PUT', body: JSON.stringify(body) },
    );
  },
};
