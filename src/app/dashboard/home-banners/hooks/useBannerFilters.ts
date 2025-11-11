import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BannerFilters } from '../types';
import { DEFAULT_FILTERS } from '../constants';

/**
 * 轮播图筛选逻辑 Hook
 * 负责管理筛选条件和 URL 同步
 */
export function useBannerFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpdatingFromSearch = useRef(false);

  const [filters, setFilters] = useState<BannerFilters>(DEFAULT_FILTERS);

  // 从 URL 初始化筛选条件
  useEffect(() => {
    if (isUpdatingFromSearch.current) {
      isUpdatingFromSearch.current = false;
      return;
    }

    const positions = searchParams.get('positions');
    
    const urlFilters: BannerFilters = {
      keyword: searchParams.get('keyword') || '',
      positions: positions ? positions.split(',') : [],
      status: searchParams.get('status') === 'all' || !searchParams.get('status') ? 'all' : (parseInt(searchParams.get('status') || '1') as 0 | 1 | 'all'),
      disabled: searchParams.get('disabled') === 'true' ? true : false,
      show_removed: searchParams.get('show_removed') === 'true' ? true : false,
      active_only: searchParams.get('active_only') === 'true' ? true : false,
      sort_by: searchParams.get('sort_by') || 'sort_order',
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
    (newFilters: Partial<BannerFilters>) => {
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
    (newFilters: Partial<BannerFilters>) => {
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
      positions: [],
      status: 'all',
      disabled: false,
      show_removed: false,
      active_only: false,
      page: 1
    });
  }, [searchFilters]);

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(
    filters.keyword ||
      (filters.positions && filters.positions.length > 0) ||
      (filters.status && filters.status !== 'all') ||
      filters.disabled ||
      filters.show_removed ||
      filters.active_only
  );

  return {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  };
}
