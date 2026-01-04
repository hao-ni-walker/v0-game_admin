/**
 * 通知模板数据类型
 */
export interface NotificationTemplate {
  id: number;
  template_code: string;
  template_name: string;
  title_template: string;
  content_template: string;
  supported_channels: string[];
  variables: Record<string, string>;
  notification_type: string;
  priority: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 模板筛选条件
 */
export interface TemplateFilters {
  keyword?: string;
  notification_type?: string;
  priority?: string;
  is_active?: boolean | 'all';
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
  total_pages: number;
}
