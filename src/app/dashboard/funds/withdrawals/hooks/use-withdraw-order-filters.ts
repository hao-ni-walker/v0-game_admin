import { useState, useCallback, useEffect } from 'react';
import type { WithdrawOrderFilters } from '../types';
import { DEFAULT_PAGE_SIZE, getDefaultDateRange } from '../constants';

export function useWithdrawOrderFilters() {
  const defaultDateRange = getDefaultDateRange();
  const [filters, setFilters] = useState<WithdrawOrderFilters>(() => {
    // 从本地存储恢复筛选条件（可选）
    const storedFilters =
      typeof window !== 'undefined'
        ? localStorage.getItem('withdrawOrderFilters')
        : null;

    if (storedFilters) {
      try {
        const parsed = JSON.parse(storedFilters);
        return {
          page: parsed.page || 1,
          pageSize: parsed.pageSize || DEFAULT_PAGE_SIZE,
          createdFrom:
            parsed.createdFrom || defaultDateRange.from.toISOString(),
          createdTo: parsed.createdTo || defaultDateRange.to.toISOString(),
          ...parsed
        };
      } catch {
        // 解析失败，使用默认值
      }
    }

    return {
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      createdFrom: defaultDateRange.from.toISOString(),
      createdTo: defaultDateRange.to.toISOString()
    };
  });

  const searchFilters = useCallback(
    (newFilters: Partial<WithdrawOrderFilters>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        page: 1 // 重置到第一页
      }));
    },
    []
  );

  const updatePagination = useCallback(
    (pagination: { page?: number; pageSize?: number }) => {
      setFilters((prev) => ({
        ...prev,
        page: pagination.page ?? prev.page,
        pageSize: pagination.pageSize ?? prev.pageSize
      }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    const defaultDateRange = getDefaultDateRange();
    setFilters({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      createdFrom: defaultDateRange.from.toISOString(),
      createdTo: defaultDateRange.to.toISOString()
    });
  }, []);

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      !['page', 'pageSize', 'createdFrom', 'createdTo'].includes(key) &&
      (filters as any)[key] !== undefined &&
      (filters as any)[key] !== null &&
      (filters as any)[key] !== ''
  );

  // 同步到本地存储（用于记住筛选条件）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('withdrawOrderFilters', JSON.stringify(filters));
      } catch (error) {
        console.warn('保存筛选条件到本地存储失败:', error);
      }
    }
  }, [filters]);

  return {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  };
}
