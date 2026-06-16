export type MessageCategory = 'trade' | 'finance' | 'system' | 'activity' | 'risk';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';
export type MessageStatus = 'unread' | 'read' | 'deleted';

export interface Message {
  message_id: string;
  user_id: number;
  category: MessageCategory;
  template_type: string;
  priority: MessagePriority;
  title: string;
  body: string;
  meta: Record<string, unknown>;
  action_url: string | null;
  action_label: string | null;
  status: MessageStatus;
  sender_type: 'system' | 'admin';
  sender_id: string | null;
  created_at: number; // unix seconds
}

export interface MessagePagination {
  page: number;
  size: number;
  total: number;
  has_more: boolean;
}

export interface MessageListResult {
  list: Message[];
  pagination: MessagePagination;
}

export interface MessageFilters {
  user_id: string;
  category: MessageCategory | '';
  page: number;
  page_size: number;
}

export interface MessageFormData {
  user_id: number;
  category: MessageCategory;
  template_type: string;
  priority: MessagePriority;
  title: string;
  body: string;
  action_url?: string;
  action_label?: string;
  meta?: Record<string, unknown>;
}
