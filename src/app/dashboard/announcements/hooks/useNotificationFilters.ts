import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { NotificationFilters } from '../types';
import { DEFAULT_FILTERS } from '../constants';

/**
 * 消息通知筛选逻辑 Hook
 * 负责管理筛选条件和 URL 同步
 */
export function useNotificationFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpdatingFromSearch = useRef(false);

  const [filters, setFilters] = useState<NotificationFilters>(DEFAULT_FILTERS);

  // 从 URL 初始化筛选条件
  useEffect(() => {
    if (isUpdatingFromSearch.current) {
      isUpdatingFromSearch.current = false;
      return;
    }

    const user_ids = searchParams.get('user_ids');
    const types = searchParams.get('types');
    const priorities = searchParams.get('priorities');
    const statuses = searchParams.get('statuses');
    
    const urlFilters: NotificationFilters = {
      keyword: searchParams.get('keyword') || '',
      user_ids: user_ids ? user_ids.split(',').map(id => parseInt(id)) : [],
      types: types ? types.split(',') : [],
      priorities: priorities ? priorities.split(',') : [],
      statuses: statuses ? statuses.split(',') : [],
      is_read: searchParams.get('is_read') === 'true' ? true : searchParams.get('is_read') === 'false' ? false : undefined,
      only_failed: searchParams.get('only_failed') === 'true' ? true : false,
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_dir: (searchParams.get('sort_dir') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      page_size: parseInt(searchParams.get('page_size') || '20')
    };
    
    setFilters(urlFilters);
  }, [searchParams]);

  /**
   * 手动搜索（更新URL）
   */
  const searchFilters = useCallback(
    (newFilters: Partial<NotificationFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };

      // 如果是筛选条件变化（非分页），重置到第一页
      if (
        Object.keys(newFilters).some((key) => !['page', 'page_size'].includes(key))
      ) {
        updatedFilters.page = 1;
      }

      setFilters(updatedFilters);

      // 标记正在从搜索更新，避免URL同步时重复触发
      isUpdatingFromSearch.current = true;

      // 更新 URL
      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== false) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.set(key, value.join(','));
            }
          } else {
            params.set(key, String(value));
          }
        }
      });

      router.push(`?${params.toString()}`);
    },
    [filters, router]
  );

  /**
   * 更新分页（仅用于分页变化）
   */
  const updatePagination = useCallback(
    (newFilters: Partial<NotificationFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);

      // 标记正在从搜索更新，避免URL同步时重复触发
      isUpdatingFromSearch.current = true;

      // 更新 URL
      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== false) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.set(key, value.join(','));
            }
          } else {
            params.set(key, String(value));
          }
        }
      });

      router.push(`?${params.toString()}`);
    },
    [filters, router]
  );

  /**
   * 清空筛选条件
   */
  const clearFilters = useCallback(() => {
    searchFilters({
      keyword: '',
      user_ids: [],
      types: [],
      priorities: [],
      statuses: [],
      is_read: undefined,
      only_failed: false,
      page: 1
    });
  }, [searchFilters]);

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(
    filters.keyword ||
      (filters.user_ids && filters.user_ids.length > 0) ||
      (filters.types && filters.types.length > 0) ||
      (filters.priorities && filters.priorities.length > 0) ||
      (filters.statuses && filters.statuses.length > 0) ||
      filters.is_read !== undefined ||
      filters.only_failed
  );

  return {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  };
}
