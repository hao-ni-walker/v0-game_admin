'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DepositDistributionFilters } from '../types';
import { DEFAULT_FILTERS } from '../constants';

/**
 * 储值分布筛选逻辑 Hook
 * 负责管理筛选条件和 URL 同步
 */
export function useDepositDistributionFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpdatingFromSearch = useRef(false);

  const [filters, setFilters] =
    useState<DepositDistributionFilters>(DEFAULT_FILTERS);

  // 从 URL 初始化筛选条件
  useEffect(() => {
    if (isUpdatingFromSearch.current) {
      isUpdatingFromSearch.current = false;
      return;
    }

    const urlFilters: DepositDistributionFilters = {
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
    (newFilters: Partial<DepositDistributionFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };

      setFilters(updatedFilters);

      // 标记正在从搜索更新，避免URL同步时重复触发
      isUpdatingFromSearch.current = true;

      // 更新 URL
      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
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
    [filters, router]
  );

  /**
   * 清空筛选条件
   */
  const clearFilters = useCallback(() => {
    searchFilters({
      start_date: undefined,
      end_date: undefined,
      dateRange: undefined
    });
  }, [searchFilters]);

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
