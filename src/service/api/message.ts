import { apiRequest, buildSearchParams } from './base';
import type { MessageFormData, MessageListResult } from '@/app/dashboard/messages/types';

export const MessageAPI = {
  getList(params: {
    user_id?: string;
    category?: string;
    page: number;
    page_size: number;
  }) {
    const query = buildSearchParams(params as Record<string, unknown>);
    return apiRequest<MessageListResult>(
      `/admin/messages${query ? `?${query}` : ''}`
    );
  },
  send(body: MessageFormData) {
    return apiRequest<{ message_id: string }>('/admin/messages', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  recall(messageId: string) {
    return apiRequest<null>(`/admin/messages/${messageId}/recall`, {
      method: 'POST',
    });
  },
};
