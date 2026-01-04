import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  NotificationTemplate,
  TemplateFilters,
  PaginationInfo
} from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';

/**
 * 模板管理逻辑 Hook
 * 负责模板数据的获取
 */
export function useTemplateManagement() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取模板列表
   */
  const fetchTemplates = useCallback(async (filters: TemplateFilters) => {
    setLoading(true);
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      params.append('page', String(filters.page || 1));
      params.append('page_size', String(filters.page_size || 10));

      if (filters.keyword) {
        params.append('keyword', filters.keyword);
      }
      if (filters.notification_type && filters.notification_type !== 'all') {
        params.append('notification_type', filters.notification_type);
      }
      if (filters.priority && filters.priority !== 'all') {
        params.append('priority', filters.priority);
      }
      if (filters.is_active !== undefined && filters.is_active !== 'all') {
        params.append('is_active', String(filters.is_active));
      }

      const response = await fetch(
        `/api/admin/notification-templates?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('获取模板列表失败');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setTemplates(result.data.items || []);
        setPagination({
          page: result.data.page || 1,
          page_size: result.data.page_size || 10,
          total: result.data.total || 0,
          total_pages: result.data.total_pages || 0
        });
      } else {
        throw new Error(result.message || '获取模板列表失败');
      }
    } catch (error) {
      console.error('获取模板列表失败:', error);
      toast.error(MESSAGES.ERROR.FETCH);
      setTemplates([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新模板列表
   */
  const refreshTemplates = useCallback(
    async (filters: TemplateFilters) => {
      await fetchTemplates(filters);
      toast.success(MESSAGES.SUCCESS.REFRESH);
    },
    [fetchTemplates]
  );

  return {
    templates,
    loading,
    pagination,
    fetchTemplates,
    refreshTemplates
  };
}
