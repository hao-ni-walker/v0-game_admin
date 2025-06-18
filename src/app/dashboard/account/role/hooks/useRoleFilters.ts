'use client';

import { useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { RoleFilters } from '../types';
import { DEFAULT_FILTERS } from '../constants';

export function useRoleFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 从URL解析筛选条件
  const parseFiltersFromUrl = useCallback((): RoleFilters => {
    return {
      name: searchParams.get('name') || DEFAULT_FILTERS.name,
      description:
        searchParams.get('description') || DEFAULT_FILTERS.description,
      status: (searchParams.get('status') as any) || DEFAULT_FILTERS.status,
      dateRange: DEFAULT_FILTERS.dateRange, // 日期范围不从URL同步
      page: parseInt(searchParams.get('page') || String(DEFAULT_FILTERS.page)),
      limit: parseInt(
        searchParams.get('limit') || String(DEFAULT_FILTERS.limit)
      )
    };
  }, [searchParams]);

  // 更新筛选条件到URL
  const updateFiltersToUrl = useCallback(
    (filters: RoleFilters) => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'dateRange') {
          // 日期范围不同步到URL，避免复杂性
          return;
        }
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`);
    },
    [router]
  );

  // 更新分页
  const updatePagination = useCallback(
    (page: number, limit?: number) => {
      const currentFilters = parseFiltersFromUrl();
      const newFilters = {
        ...currentFilters,
        page,
        ...(limit && { limit })
      };
      updateFiltersToUrl(newFilters);
    },
    [parseFiltersFromUrl, updateFiltersToUrl]
  );

  // 搜索筛选条件
  const searchFilters = useCallback(
    (newFilters: Partial<RoleFilters>) => {
      const currentFilters = parseFiltersFromUrl();
      const updatedFilters = {
        ...currentFilters,
        ...newFilters,
        page: 1 // 重置到第一页
      };
      updateFiltersToUrl(updatedFilters);
    },
    [parseFiltersFromUrl, updateFiltersToUrl]
  );

  // 清空筛选条件
  const clearFilters = useCallback(() => {
    updateFiltersToUrl(DEFAULT_FILTERS);
  }, [updateFiltersToUrl]);

  return {
    parseFiltersFromUrl,
    updateFiltersToUrl,
    updatePagination,
    searchFilters,
    clearFilters
  };
}
