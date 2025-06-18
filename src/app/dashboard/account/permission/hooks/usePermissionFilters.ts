'use client';

import { useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PermissionFilters } from '../types';
import { DEFAULT_FILTERS } from '../constants';

export function usePermissionFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 从URL解析筛选条件
  const parseFiltersFromUrl = useCallback((): PermissionFilters => {
    return {
      name: searchParams.get('name') || DEFAULT_FILTERS.name,
      code: searchParams.get('code') || DEFAULT_FILTERS.code,
      description:
        searchParams.get('description') || DEFAULT_FILTERS.description,
      dateRange: DEFAULT_FILTERS.dateRange, // 日期范围不从URL同步
      page: parseInt(searchParams.get('page') || String(DEFAULT_FILTERS.page)),
      limit: parseInt(
        searchParams.get('limit') || String(DEFAULT_FILTERS.limit)
      )
    };
  }, [searchParams]);

  // 更新筛选条件到URL
  const updateFiltersToUrl = useCallback(
    (filters: PermissionFilters) => {
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
    (newFilters: Partial<PermissionFilters>) => {
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
