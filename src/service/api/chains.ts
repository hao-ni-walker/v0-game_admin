import { apiRequest } from './base';

export interface ChainInfo {
  chain_code: string;
  chain_group: string;
  is_active: boolean;
}

/** Read-only chain registry picker source (admin backend /admin/chains). */
export const ChainAPI = {
  list(activeOnly = false) {
    const qs = activeOnly ? '?active_only=true' : '';
    return apiRequest<{ items: ChainInfo[] }>(`/admin/chains${qs}`);
  },
};
