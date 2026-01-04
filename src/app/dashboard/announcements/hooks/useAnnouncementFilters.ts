import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnnouncementFilters } from '../types';
import { DEFAULT_FILTERS } from '../constants';

/**
 * 公告筛选逻辑 Hook
 * 负责管理筛选条件和 URL 同步
 */
export function useAnnouncementFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpdatingFromSearch = useRef(false);

  const [filters, setFilters] = useState<AnnouncementFilters>(DEFAULT_FILTERS);

  // 从 URL 初始化筛选条件
  useEffect(() => {
    if (isUpdatingFromSearch.current) {
      isUpdatingFromSearch.current = false;
      return;
    }

    const urlFilters: AnnouncementFilters = {
      keyword: searchParams.get('keyword') || '',
      notification_type: searchParams.get('notification_type') || undefined,
      status:
        (searchParams.get('status') as 'pending' | 'read' | 'sent' | 'all') ||
        'all',
      is_read:
        searchParams.get('is_read') === 'true'
          ? true
          : searchParams.get('is_read') === 'false'
            ? false
            : undefined,
      user_id: searchParams.get('user_id')
        ? parseInt(searchParams.get('user_id')!)
        : undefined,
      created_from: searchParams.get('created_from') || undefined,
      created_to: searchParams.get('created_to') || undefined,
      sent_from: searchParams.get('sent_from') || undefined,
      sent_to: searchParams.get('sent_to') || undefined,
      read_from: searchParams.get('read_from') || undefined,
      read_to: searchParams.get('read_to') || undefined,
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_dir: (searchParams.get('sort_dir') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      page_size: parseInt(searchParams.get('page_size') || '10')
    };

    setFilters(urlFilters);
  }, [searchParams]);

  /**
   * 手动搜索（更新URL）
   */
  const searchFilters = useCallback(
    (newFilters: Partial<AnnouncementFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };

      // 如果是筛选条件变化（非分页），重置到第一页
      if (
        Object.keys(newFilters).some(
          (key) => !['page', 'page_size'].includes(key)
        )
      ) {
        updatedFilters.page = 1;
      }

      setFilters(updatedFilters);

      // 标记正在从搜索更新，避免URL同步时重复触发
      isUpdatingFromSearch.current = true;

      // 更新 URL
      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          value !== 'all' &&
          value !== false
        ) {
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
    (newFilters: Partial<AnnouncementFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);

      // 标记正在从搜索更新，避免URL同步时重复触发
      isUpdatingFromSearch.current = true;

      // 更新 URL
      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          value !== 'all' &&
          value !== false
        ) {
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
      notification_type: undefined,
      status: 'all',
      is_read: undefined,
      user_id: undefined,
      created_from: undefined,
      created_to: undefined,
      sent_from: undefined,
      sent_to: undefined,
      read_from: undefined,
      read_to: undefined,
      page: 1
    });
  }, [searchFilters]);

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(
    filters.keyword ||
      filters.notification_type ||
      filters.status !== 'all' ||
      filters.is_read !== undefined ||
      filters.user_id ||
      filters.created_from ||
      filters.created_to ||
      filters.sent_from ||
      filters.sent_to ||
      filters.read_from ||
      filters.read_to
  );

  return {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  };
}
