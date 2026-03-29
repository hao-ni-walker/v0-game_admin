'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GameFlowFilters } from '../types';
import { DEFAULT_FILTERS } from '../constants';

/**
 * 游戏流水筛选逻辑 Hook
 * 负责管理筛选条件和 URL 同步
 */
export function useGameFlowFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpdatingFromSearch = useRef(false);

  const [filters, setFilters] = useState<GameFlowFilters>(DEFAULT_FILTERS);

  // 从 URL 初始化筛选条件
  useEffect(() => {
    if (isUpdatingFromSearch.current) {
      isUpdatingFromSearch.current = false;
      return;
    }

    const urlFilters: GameFlowFilters = {
      bet_time_start: searchParams.get('bet_time_start') || undefined,
      bet_time_end: searchParams.get('bet_time_end') || undefined,
      game_id: searchParams.get('game_id')
        ? parseInt(searchParams.get('game_id')!)
        : undefined,
      platform_id: searchParams.get('platform_id')
        ? parseInt(searchParams.get('platform_id')!)
        : undefined,
      dateRange: undefined, // 日期范围暂不从URL同步，避免复杂性
      page: parseInt(searchParams.get('page') || '1'),
      page_size: parseInt(searchParams.get('page_size') || '10'),
      sort_by: searchParams.get('sort_by') || undefined,
      sort_order:
        (searchParams.get('sort_order') as 'asc' | 'desc') || undefined
    };
    setFilters(urlFilters);
  }, [searchParams]);

  /**
   * 手动搜索（不自动更新URL）
   */
  const searchFilters = useCallback(
    (newFilters: Partial<GameFlowFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };

      // 如果是筛选条件变化（非分页），重置到第一页
      if (
        Object.keys(newFilters).some(
          (key) => !['page', 'page_size', 'sort_by', 'sort_order'].includes(key)
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
   * 更新分页（仅用于分页变化）
   */
  const updatePagination = useCallback(
    (newFilters: Partial<GameFlowFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);

      // 标记正在从搜索更新，避免URL同步时重复触发
      isUpdatingFromSearch.current = true;

      // 更新 URL
      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (key === 'dateRange') {
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
      bet_time_start: undefined,
      bet_time_end: undefined,
      game_id: undefined,
      platform_id: undefined,
      dateRange: undefined,
      page: 1
    });
  }, [searchFilters]);

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(
    filters.bet_time_start ||
      filters.bet_time_end ||
      filters.game_id ||
      filters.platform_id ||
      filters.dateRange
  );

  return {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  };
}
