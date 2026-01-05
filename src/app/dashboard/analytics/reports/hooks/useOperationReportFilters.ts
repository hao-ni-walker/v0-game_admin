'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { OperationReportFilters } from '../types';
import { DEFAULT_FILTERS } from '../constants';

/**
 * 运营报表筛选逻辑 Hook
 * 负责管理筛选条件和 URL 同步
 */
export function useOperationReportFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpdatingFromSearch = useRef(false);

  const [filters, setFilters] =
    useState<OperationReportFilters>(DEFAULT_FILTERS);

  // 从 URL 初始化筛选条件
  useEffect(() => {
    if (isUpdatingFromSearch.current) {
      isUpdatingFromSearch.current = false;
      return;
    }

    const urlFilters: OperationReportFilters = {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      dateRange: undefined // 日期范围暂不从URL同步，避免复杂性
    };
    setFilters(urlFilters);
  }, [searchParams]);

  /**
   * 手动搜索（不自动更新URL）
   */
  const searchFilters = useCallback(
    (newFilters: Partial<OperationReportFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);

      // 更新 URL
      isUpdatingFromSearch.current = true;
      const params = new URLSearchParams();

      if (updatedFilters.start_date) {
        params.set('start_date', updatedFilters.start_date);
      }
      if (updatedFilters.end_date) {
        params.set('end_date', updatedFilters.end_date);
      }

      const queryString = params.toString();
      router.push(
        queryString
          ? `/dashboard/analytics/reports?${queryString}`
          : '/dashboard/analytics/reports'
      );
    },
    [filters, router]
  );

  /**
   * 清除所有筛选条件
   */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    isUpdatingFromSearch.current = true;
    router.push('/dashboard/analytics/reports');
  }, [router]);

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(
    filters.start_date || filters.end_date || filters.dateRange
  );

  return {
    filters,
    searchFilters,
    clearFilters,
    hasActiveFilters
  };
}
