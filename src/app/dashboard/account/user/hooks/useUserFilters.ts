import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { UserFilters } from '../types';
import { DEFAULT_FILTERS } from '../constants';

/**
 * 用户筛选逻辑 Hook
 * 负责管理筛选条件和 URL 同步
 */
export function useUserFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);

  // 从 URL 初始化筛选条件
  useEffect(() => {
    const urlFilters: UserFilters = {
      username: searchParams.get('username') || '',
      email: searchParams.get('email') || '',
      roleId: searchParams.get('roleId') || '',
      dateRange: undefined, // 日期范围暂不从URL同步，避免复杂性
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10')
    };
    setFilters(urlFilters);
  }, [searchParams]);

  /**
   * 手动搜索（不自动更新URL）
   */
  const searchFilters = useCallback(
    (newFilters: Partial<UserFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };

      // 如果是筛选条件变化（非分页），重置到第一页
      if (
        Object.keys(newFilters).some((key) => !['page', 'limit'].includes(key))
      ) {
        updatedFilters.page = 1;
      }

      setFilters(updatedFilters);

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
    (newFilters: Partial<UserFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);

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
      username: '',
      email: '',
      roleId: '',
      dateRange: undefined,
      page: 1
    });
  }, [searchFilters]);

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(
    filters.username || filters.email || filters.roleId || filters.dateRange
  );

  return {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  };
}
