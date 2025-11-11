import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SystemConfigFilters } from '../types';
import { DEFAULT_FILTERS } from '../constants';

/**
 * 系统配置筛选逻辑 Hook
 * 负责管理筛选条件和 URL 同步
 */
export function useSystemConfigFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpdatingFromSearch = useRef(false);

  const [filters, setFilters] = useState<SystemConfigFilters>(DEFAULT_FILTERS);

  // 从 URL 初始化筛选条件
  useEffect(() => {
    if (isUpdatingFromSearch.current) {
      isUpdatingFromSearch.current = false;
      return;
    }

    const config_types = searchParams.get('config_types');
    
    const urlFilters: SystemConfigFilters = {
      keyword: searchParams.get('keyword') || '',
      config_types: config_types ? config_types.split(',') : [],
      is_public: searchParams.get('is_public') === 'true' ? true : searchParams.get('is_public') === 'false' ? false : undefined,
      disabled: searchParams.get('disabled') === 'true' ? true : false,
      show_removed: searchParams.get('show_removed') === 'true' ? true : false,
      sort_by: searchParams.get('sort_by') || 'updated_at',
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
    (newFilters: Partial<SystemConfigFilters>) => {
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
    (newFilters: Partial<SystemConfigFilters>) => {
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
      config_types: [],
      is_public: undefined,
      disabled: false,
      show_removed: false,
      page: 1
    });
  }, [searchFilters]);

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(
    filters.keyword ||
      (filters.config_types && filters.config_types.length > 0) ||
      filters.is_public !== undefined ||
      filters.disabled ||
      filters.show_removed
  );

  return {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  };
}
