/**
 * 通知数据类型（对应 /api/admin/notifications 接口）
 */
export interface Announcement {
  id: number;
  user_id: number;
  title: string;
  content: string;
  notification_type: string; // 如 "REWARD", "system" 等
  priority: string; // 如 "normal", "high", "low" 等
  status: 'pending' | 'read' | 'sent'; // 通知状态
  is_read: boolean;
  created_at: string;
  sent_at: string | null;
  read_at: string | null;
  meta_data: Record<string, any>; // 元数据
}

/**
 * 通知筛选条件
 */
export interface AnnouncementFilters {
  keyword?: string;
  notification_type?: string;
  status?: 'pending' | 'read' | 'sent' | 'all';
  is_read?: boolean;
  user_id?: number;
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
 * 通知表单数据
 */
export interface AnnouncementFormData {
  user_id: number;
  title: string;
  content: string;
  notification_type: string;
  priority: string;
  meta_data?: Record<string, any>;
}

/**
 * 对话框状态
 */
export type AnnouncementDialogType =
  | 'create'
  | 'edit'
  | 'view'
  | 'preview'
  | null;

export interface AnnouncementDialogState {
  type: AnnouncementDialogType;
  announcement: Announcement | null;
  open: boolean;
}

/**
 * 下拉选项
 */
export interface Option {
  label: string;
  value: string | number;
}
