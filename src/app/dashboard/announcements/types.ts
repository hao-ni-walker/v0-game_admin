/**
 * 消息通知数据类型
 */
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  content: string;
  notification_type: 'system' | 'order' | 'payment' | 'activity' | 'security' | 'interactive';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  is_read: boolean;
  created_at: string;
  sent_at?: string;
  read_at?: string;
  meta_data?: Record<string, any>;
  channels_count?: Record<string, { sent: number; delivered: number; failed: number }>;
}

/**
 * 消息通知筛选条件
 */
export interface NotificationFilters {
  keyword?: string;
  user_ids?: number[];
  types?: string[];
  priorities?: string[];
  statuses?: string[];
  is_read?: boolean;
  channel?: string;
  only_failed?: boolean;
  created_from?: string;
  created_to?: string;
  sent_from?: string;
  sent_to?: string;
  read_from?: string;
  read_to?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

/**
 * 分页信息
 */
export interface PaginationInfo {
  page: number;
  page_size: number;
  total: number;
  totalPages: number;
}

/**
 * 消息通知表单数据
 */
export interface NotificationFormData {
  user_id: number;
  title: string;
  content: string;
  notification_type: 'system' | 'order' | 'payment' | 'activity' | 'security' | 'interactive';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  meta_data?: Record<string, any>;
}

/**
 * 对话框状态
 */
export type NotificationDialogType = 'view' | null;

export interface NotificationDialogState {
  type: NotificationDialogType;
  notification: Notification | null;
  open: boolean;
}

/**
 * 下拉选项
 */
export interface Option {
  label: string;
  value: string;
}
