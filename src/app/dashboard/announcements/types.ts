/**
 * 公告数据类型
 */
export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 1 | 2 | 3; // 1=系统公告 2=活动公告 3=维护公告
  priority: 1 | 2 | 3; // 1=高 2=中 3=低
  start_time: string | null;
  end_time: string | null;
  status: 0 | 1; // 0=下线 1=上线
  version: number;
  created_at: string;
  updated_at: string;
  removed: boolean;
  disabled: boolean;
  activity_code?: string; // 关联活动代码（type=2时）
}

/**
 * 公告筛选条件
 */
export interface AnnouncementFilters {
  keyword?: string;
  types?: number[];
  status?: 0 | 1 | 'all';
  disabled?: boolean;
  show_removed?: boolean;
  active_only?: boolean;
  start_from?: string;
  start_to?: string;
  end_from?: string;
  end_to?: string;
  created_from?: string;
  created_to?: string;
  updated_from?: string;
  updated_to?: string;
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
 * 公告表单数据
 */
export interface AnnouncementFormData {
  title: string;
  content: string;
  type: 1 | 2 | 3;
  priority: 1 | 2 | 3;
  start_time?: string | null;
  end_time?: string | null;
  status: 0 | 1;
  disabled: boolean;
  activity_code?: string;
}

/**
 * 对话框状态
 */
export type AnnouncementDialogType = 'create' | 'edit' | 'view' | 'preview' | null;

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
