import { apiRequest, buildSearchParams } from './base';

export interface BroadcastFormData {
  target_type: 'all' | 'vip_level' | 'user_list' | 'condition';
  target_config: Record<string, unknown>;
  category: string;
  template_type: string;
  priority: string;
  title: string;
  body: string;
  action_url?: string;
  action_label?: string;
}

export interface BroadcastCreateResult {
  broadcast_id: string;
  status: string;
  estimated_target_count: number;
}

export interface BroadcastApproveResult {
  broadcast_id: string;
  status: string;
}

export const BroadcastAPI = {
  create(body: BroadcastFormData) {
    return apiRequest<BroadcastCreateResult>('/admin/messages/broadcasts', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  getList(params: {
    page: number;
    page_size: number;
    status?: string;
  }) {
    const query = buildSearchParams(params as Record<string, unknown>);
    return apiRequest(
      `/admin/messages/broadcasts${query ? `?${query}` : ''}`,
    );
  },
  approve(broadcastId: string) {
    return apiRequest<BroadcastApproveResult>(
      `/admin/messages/broadcasts/${broadcastId}/approve`,
      { method: 'POST' },
    );
  },
  reject(broadcastId: string) {
    return apiRequest<BroadcastApproveResult>(
      `/admin/messages/broadcasts/${broadcastId}/reject`,
      { method: 'POST' },
    );
  },
};
