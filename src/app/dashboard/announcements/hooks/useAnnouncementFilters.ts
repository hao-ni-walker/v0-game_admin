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

    const types = searchParams.get('types');
    
    const urlFilters: AnnouncementFilters = {
      keyword: searchParams.get('keyword') || '',
      types: types ? types.split(',').map(Number) : [],
      status: searchParams.get('status') === 'all' ? 'all' : searchParams.get('status') === '1' ? 1 : searchParams.get('status') === '0' ? 0 : 'all',
      disabled: searchParams.get('disabled') === 'true' ? true : searchParams.get('disabled') === 'false' ? false : false,
      show_removed: searchParams.get('show_removed') === 'true',
      active_only: searchParams.get('active_only') === 'true',
      start_from: searchParams.get('start_from') || undefined,
      start_to: searchParams.get('start_to') || undefined,
      end_from: searchParams.get('end_from') || undefined,
      end_to: searchParams.get('end_to') || undefined,
      created_from: searchParams.get('created_from') || undefined,
      created_to: searchParams.get('created_to') || undefined,
      updated_from: searchParams.get('updated_from') || undefined,
      updated_to: searchParams.get('updated_to') || undefined,
      sort_by: searchParams.get('sort_by') || 'default',
      sort_dir: (searchParams.get('sort_dir') as 'asc' | 'desc') || 'asc',
      page: parseInt(searchParams.get('page') || '1'),
      page_size: parseInt(searchParams.get('page_size') || '20')
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
        if (value !== undefined && value !== null && value !== '' && value !== 'all' && value !== false) {
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
        if (value !== undefined && value !== null && value !== '' && value !== 'all' && value !== false) {
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
      types: [],
      status: 'all',
      disabled: false,
      show_removed: false,
      active_only: false,
      start_from: undefined,
      start_to: undefined,
      end_from: undefined,
      end_to: undefined,
      created_from: undefined,
      created_to: undefined,
      updated_from: undefined,
      updated_to: undefined,
      page: 1
    });
  }, [searchFilters]);

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(
    filters.keyword ||
      (filters.types && filters.types.length > 0) ||
      (filters.status !== 'all') ||
      filters.disabled ||
      filters.show_removed ||
      filters.active_only ||
      filters.start_from ||
      filters.start_to ||
      filters.end_from ||
      filters.end_to ||
      filters.created_from ||
      filters.created_to ||
      filters.updated_from ||
      filters.updated_to
  );

  return {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  };
}
